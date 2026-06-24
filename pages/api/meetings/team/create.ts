// pages/api/meetings/team/create.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { HTTPSTATUS } from '@/lib/http-status'
import { getCurrentUser } from 'models/user'
import { googleCalendarClient } from 'lib/oauth'
import { google } from 'googleapis'
import { IntegrationAppType, EventLocationType, MeetingStatus } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import { sendEmail } from 'lib/email/sendEmail' 
import { notifyMeetingScheduled } from '@/lib/notifications/notification.triggers'
import { broadcastToUser } from '../../notifications/stream' 
import { createConferioMeeting } from 'lib/conferio-schedule'
import { createZoomMeeting } from 'lib/zoom-schedule'
import { BadRequestException } from '@/lib/errors'

// Email template (keep your existing generateEmailContent function)
const generateEmailContent = ({ 
  meetingTitle, 
  organizerName, 
  startTime, 
  endTime, 
  meetLink, 
  teamName,
  description 
}: any) => {
  const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
  
  return {
    subject: `Meeting Invitation: ${meetingTitle}${teamName ? ` with ${teamName}` : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Meeting Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h1 style="color: #333333; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">You're Invited to a Meeting</h1>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                        Hello,
                      </p>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                        <strong style="color: #333333;">${organizerName}</strong> has invited you to a meeting${teamName ? ` with <strong style="color: #333333;">${teamName}</strong>` : ''}.
                      </p>

                      <table role="presentation" style="width: 100%; background-color: #f5f5f5; border-radius: 8px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="color: #333333; font-size: 20px; margin: 0 0 16px 0; font-weight: 600;">${meetingTitle}</h2>
                            
                            <p style="color: #555555; font-size: 14px; line-height: 20px; margin: 0 0 8px 0;">
                              <strong style="color: #333333;">When:</strong> ${startTime}
                            </p>
                            
                            <p style="color: #555555; font-size: 14px; line-height: 20px; margin: 0 0 8px 0;">
                              <strong style="color: #333333;">Duration:</strong> ${duration} minutes
                            </p>
                            
                            ${description ? `
                              <p style="color: #555555; font-size: 14px; line-height: 20px; margin: 0 0 16px 0;">
                                <strong style="color: #333333;">Description:</strong> ${description}
                              </p>
                            ` : ''}
                            
                            ${meetLink ? `
                              <table role="presentation" style="margin-top: 16px;">
                                <tr>
                                  <td>
                                    <a href="${meetLink}" style="display: inline-block; background-color: #0070f3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 600;">Join Meeting</a>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-top: 12px;">
                                    <p style="color: #666666; font-size: 12px; margin: 0;">Or copy this link: <span style="color: #0070f3; word-break: break-all;">${meetLink}</span></p>
                                  </td>
                                </tr>
                              </table>
                            ` : ''}
                          </td>
                        </tr>
                      </table>

                      <p style="color: #888888; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
                        This meeting was scheduled via Conferio.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' })
  }

  try {
    const user = await getCurrentUser(req, res)
    if (!user) return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' })

    const {
      eventId, startTime, endTime, title,
      description, teamId, selectedMemberIds, externalAttendees,
    } = req.body

    // ─── PHASE 1: Parallel validation queries ───────────────────────────────
    const [teamMemberCheck, event] = await Promise.all([
      // Membership check (only if teamId provided)
      teamId
        ? prisma.teamMember.findFirst({ where: { teamId, userId: user.id } })
        : Promise.resolve(true), // skip check
      // Event fetch
      prisma.event.findFirst({
        where: { id: eventId, userId: user.id },
        include: { user: true },
      }),
    ])

    if (teamId && !teamMemberCheck) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({ message: 'Not a member of this team' })
    }
    if (!event) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({ message: 'Event not found' })
    }

    // ─── PHASE 2: Parallel attendee + team data fetch ───────────────────────
    let targetTeamId = teamId

    const [teamData, selectedMembers, fallbackMember] = await Promise.all([
      // Fetch full team+members in one query (also gives us team name — no extra query later)
      teamId
        ? prisma.team.findUnique({
            where: { id: teamId },
            include: { members: { include: { user: true } } },
          })
        : Promise.resolve(null),
      // Fetch selected individual members (if no teamId)
      !teamId && selectedMemberIds?.length
        ? prisma.teamMember.findMany({
            where: { userId: { in: selectedMemberIds } },
            include: { user: true },
          })
        : Promise.resolve([]),
      // Fallback: infer teamId from first selectedMember
      !teamId && selectedMemberIds?.length
        ? prisma.teamMember.findFirst({
            where: { userId: selectedMemberIds[0] },
          })
        : Promise.resolve(null),
    ])

    if (!teamId && fallbackMember) {
      targetTeamId = fallbackMember.teamId
    }

    // ─── PHASE 3: Build deduplicated attendee list ──────────────────────────
    const attendeeMap = new Map<string, {
      userId?: string; email: string; name: string; isExternal: boolean
    }>()

    const sourceMembers = teamId
      ? (teamData?.members ?? [])
      : (selectedMembers as typeof teamData extends null ? never : NonNullable<typeof teamData>['members'])

    for (const m of sourceMembers) {
      const email = m.user.email.toLowerCase().trim()
      if (!attendeeMap.has(email)) {
        attendeeMap.set(email, {
          userId: m.user.id,
          email,
          name: m.user.name || email.split('@')[0],
          isExternal: false,
        })
      }
    }

    const validatedExternalAttendees: { email: string; name: string }[] = []
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    for (const ext of (externalAttendees ?? [])) {
      const email = ext.email.toLowerCase().trim()
      if (emailRegex.test(email) && !attendeeMap.has(email)) {
        const name = ext.name || email.split('@')[0]
        attendeeMap.set(email, { email, name, isExternal: true })
        validatedExternalAttendees.push({ email, name })
      }
    }

    const allAttendees = Array.from(attendeeMap.values())
    if (allAttendees.length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({ message: 'No attendees selected' })
    }

    // ─── PHASE 4: Create external meeting link ──────────────────────────────
    let meetLink = ''
    let calendarEventId = ''
    let externalMeetingId: string | null = null
    let calendarAppType = ''
    const locationType = event.locationType as string

    if (locationType === 'CONFERIO' || locationType === EventLocationType.CONFERIO) {
      const conferioMeeting = await createConferioMeeting({
        title: title || event.title,
        hostEmail: user.email,
        duration: event.duration,
      })
      meetLink = conferioMeeting.joinUrl
      externalMeetingId = conferioMeeting.roomId
      calendarAppType = 'CONFERIO'

    } else if (locationType === 'ZOOM_MEETING' || locationType === EventLocationType.ZOOM_MEETING) {
      const zoomIntegration = await prisma.integration.findFirst({
        where: { userId: user.id, appType: IntegrationAppType.ZOOM_MEETING },
      })
      const zoomMeeting = await createZoomMeeting({
        topic: title || event.title,
        startTime: new Date(startTime),
        duration: event.duration,
        hostEmail: zoomIntegration?.metadata?.hostEmail as string | undefined,
      })
      meetLink = zoomMeeting.joinUrl
      externalMeetingId = zoomMeeting.id
      calendarAppType = 'ZOOM_MEETING'

    } else if (
      locationType === 'GOOGLE_MEET_AND_CALENDAR' ||
      locationType === EventLocationType.GOOGLE_MEET_AND_CALENDAR
    ) {
      const integration = await prisma.integration.findFirst({
        where: { userId: user.id, appType: IntegrationAppType.GOOGLE_MEET_AND_CALENDAR },
      })
      if (integration) {
        googleCalendarClient.setCredentials({
          access_token: integration.accessToken,
          refresh_token: integration.refreshToken,
        })
        const calendar = google.calendar({ version: 'v3', auth: googleCalendarClient })
        const calendarEvent = await calendar.events.insert({
          calendarId: 'primary',
          conferenceDataVersion: 1,
          requestBody: {
            summary: title || event.title,
            description: description || event.description,
            start: { dateTime: new Date(startTime).toISOString() },
            end: { dateTime: new Date(endTime).toISOString() },
            attendees: [...allAttendees.map(a => ({ email: a.email })), { email: user.email }],
            conferenceData: { createRequest: { requestId: `${event.id}-${Date.now()}` } },
          },
        })
        meetLink = calendarEvent.data.hangoutLink || ''
        calendarEventId = calendarEvent.data.id || ''
        calendarAppType = 'GOOGLE_MEET_AND_CALENDAR'
      }
    } else {
      throw new BadRequestException(`Unsupported location type: ${locationType}`)
    }

    // ─── PHASE 5: DB write ──────────────────────────────────────────────────
    const meeting = await prisma.meeting.create({
      data: {
        eventId: event.id,
        userId: user.id,
        guestName: allAttendees[0]?.name || 'Team Meeting',
        guestEmail: allAttendees[0]?.email || 'team@meeting.com',
        additionalInfo: description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetLink,
        calendarEventId,
        calendarAppType,
        status: MeetingStatus.SCHEDULED,
        ...(externalMeetingId ? { metadata: { externalMeetingId } } : {}),
        meetingAttendees: {
          create: allAttendees.map(att => ({
            userId: att.userId || null,
            email: att.email,
            name: att.name,
            isExternal: att.isExternal,
            status: 'pending',
          })),
        },
        teamMeetingLink: teamId
          ? { create: { teamId, shareToken: createId() } }
          : undefined,
      },
      include: {
        meetingAttendees: true,
        teamMeetingLink: true,
        event: true,
      },
    })

    // ─── PHASE 6: Fire-and-forget side effects (don't block response) ───────
    const teamName = teamData?.name
    const internalAttendeeUserIds = allAttendees
      .filter(a => !a.isExternal && a.userId && a.userId !== user.id)
      .map(a => a.userId!)

    // Return response immediately — emails + notifications run in background
    setImmediate(async () => {
      try {
        // Emails + notifications in parallel
        await Promise.all([
          // External attendee emails
          ...validatedExternalAttendees.map(async (ext) => {
            try {
              const emailContent = generateEmailContent({
                meetingTitle: title || event.title,
                organizerName: user.name || user.email,
                startTime: new Date(startTime).toLocaleString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long',
                  day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
                }),
                endTime, meetLink, teamName, description,
              })
              await sendEmail({ to: ext.email, subject: emailContent.subject, html: emailContent.html })
            } catch (e) {
              console.error(`❌ Email failed for ${ext.email}:`, e)
            }
          }),
          // Internal notifications
          internalAttendeeUserIds.length > 0
            ? (async () => {
                await notifyMeetingScheduled({
                  attendeeUserIds: internalAttendeeUserIds,
                  organizerName: user.name ?? user.email ?? 'Someone',
                  meetingId: meeting.id,
                  meetingTitle: title || event.title,
                  startTime: new Date(startTime),
                  endTime: new Date(endTime),
                  meetLink,
                })
                // Fetch all notifications in ONE query instead of N queries in a loop
                const notifications = await prisma.notification.findMany({
                  where: {
                    userId: { in: internalAttendeeUserIds },
                    meetingId: meeting.id,
                    type: 'MEETING_SCHEDULED',
                  },
                  orderBy: { createdAt: 'desc' },
                })
                // Group by userId and broadcast
                const notifByUser = new Map(notifications.map(n => [n.userId, n]))
                for (const uid of internalAttendeeUserIds) {
                  const notification = notifByUser.get(uid)
                  if (notification) broadcastToUser(uid, { type: 'notification', notification })
                }
              })()
            : Promise.resolve(),
        ])
      } catch (e) {
        console.error('Background tasks error:', e)
      }
    })

    return res.status(HTTPSTATUS.CREATED).json({
      message: 'Team meeting scheduled successfully',
      data: {
        meeting,
        attendeeCount: allAttendees.length,
        externalAttendeesInvited: validatedExternalAttendees.length,
        shareLink: meeting.teamMeetingLink?.shareToken
          ? `${process.env.NEXT_PUBLIC_APP_URL}/meetings/join/${meeting.teamMeetingLink.shareToken}`
          : null,
      },
    })

  } catch (error: any) {
    console.error('Error creating team meeting:', error)
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message || 'Internal server error',
    })
  }
}



// // pages/api/meetings/team/create.ts this code is working but taking so long to execute and schedule 
// import { NextApiRequest, NextApiResponse } from 'next'
// import { prisma } from '@/lib/prisma'
// import { HTTPSTATUS } from '@/lib/http-status'
// import { getCurrentUser } from 'models/user'
// import { googleCalendarClient } from 'lib/oauth'
// import { google } from 'googleapis'
// import { IntegrationAppType, EventLocationType, MeetingStatus } from '@prisma/client'
// import { createId } from '@paralleldrive/cuid2'
// import { sendEmail } from 'lib/email/sendEmail' 
// import { notifyMeetingScheduled } from '@/lib/notifications/notification.triggers'
// import { broadcastToUser } from '../../notifications/stream' 
// import { createConferioMeeting } from 'lib/conferio-schedule'
// import { createZoomMeeting } from 'lib/zoom-schedule'
// import { BadRequestException } from '@/lib/errors'

// // Email template (keep your existing generateEmailContent function)
// const generateEmailContent = ({ 
//   meetingTitle, 
//   organizerName, 
//   startTime, 
//   endTime, 
//   meetLink, 
//   teamName,
//   description 
// }: any) => {
//   const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
  
//   return {
//     subject: `Meeting Invitation: ${meetingTitle}${teamName ? ` with ${teamName}` : ''}`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Meeting Invitation</title>
//         </head>
//         <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
//           <table role="presentation" style="width: 100%; border-collapse: collapse;">
//             <tr>
//               <td align="center" style="padding: 40px 0;">
//                 <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
//                   <tr>
//                     <td style="padding: 40px 30px;">
//                       <h1 style="color: #333333; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">You're Invited to a Meeting</h1>
                      
//                       <p style="color: #555555; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
//                         Hello,
//                       </p>
                      
//                       <p style="color: #555555; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
//                         <strong style="color: #333333;">${organizerName}</strong> has invited you to a meeting${teamName ? ` with <strong style="color: #333333;">${teamName}</strong>` : ''}.
//                       </p>

//                       <table role="presentation" style="width: 100%; background-color: #f5f5f5; border-radius: 8px; margin: 24px 0;">
//                         <tr>
//                           <td style="padding: 24px;">
//                             <h2 style="color: #333333; font-size: 20px; margin: 0 0 16px 0; font-weight: 600;">${meetingTitle}</h2>
                            
//                             <p style="color: #555555; font-size: 14px; line-height: 20px; margin: 0 0 8px 0;">
//                               <strong style="color: #333333;">When:</strong> ${startTime}
//                             </p>
                            
//                             <p style="color: #555555; font-size: 14px; line-height: 20px; margin: 0 0 8px 0;">
//                               <strong style="color: #333333;">Duration:</strong> ${duration} minutes
//                             </p>
                            
//                             ${description ? `
//                               <p style="color: #555555; font-size: 14px; line-height: 20px; margin: 0 0 16px 0;">
//                                 <strong style="color: #333333;">Description:</strong> ${description}
//                               </p>
//                             ` : ''}
                            
//                             ${meetLink ? `
//                               <table role="presentation" style="margin-top: 16px;">
//                                 <tr>
//                                   <td>
//                                     <a href="${meetLink}" style="display: inline-block; background-color: #0070f3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 600;">Join Meeting</a>
//                                   </td>
//                                 </tr>
//                                 <tr>
//                                   <td style="padding-top: 12px;">
//                                     <p style="color: #666666; font-size: 12px; margin: 0;">Or copy this link: <span style="color: #0070f3; word-break: break-all;">${meetLink}</span></p>
//                                   </td>
//                                 </tr>
//                               </table>
//                             ` : ''}
//                           </td>
//                         </tr>
//                       </table>

//                       <p style="color: #888888; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
//                         This meeting was scheduled via Conferio.
//                       </p>
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>
//           </table>
//         </body>
//       </html>
//     `
//   }
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' })
//   }

//   try {
//     const user = await getCurrentUser(req, res)
//     if (!user) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' })
//     }

//     const {
//       eventId,
//       startTime,
//       endTime,
//       title,
//       description,
//       teamId,
//       selectedMemberIds,
//       externalAttendees,
//     } = req.body

//     // Verify user is member of the specified team (if provided)
//     let targetTeamId = teamId
//     if (teamId) {
//       const teamMember = await prisma.teamMember.findFirst({
//         where: {
//           teamId: teamId,
//           userId: user.id,
//         },
//       })
//       if (!teamMember) {
//         return res.status(HTTPSTATUS.FORBIDDEN).json({ message: 'Not a member of this team' })
//       }
//     } else if (selectedMemberIds && selectedMemberIds.length > 0) {
//       const member = await prisma.teamMember.findFirst({
//         where: { userId: selectedMemberIds[0] },
//         include: { team: true }
//       })
//       if (member) {
//         targetTeamId = member.teamId
//       }
//     }

//     // Get event details
//     const event = await prisma.event.findFirst({
//       where: { 
//         id: eventId,
//         userId: user.id,
//       },
//       include: { user: true }
//     })

//     if (!event) {
//       return res.status(HTTPSTATUS.NOT_FOUND).json({ message: 'Event not found' })
//     }

//     // ═══════════════════════════════════════════════════════════════════
//     // COLLECT ATTENDEES WITH PROPER DEDUPLICATION
//     // ═══════════════════════════════════════════════════════════════════
    
//     // Use a Map to ensure unique emails (key = email, value = attendee data)
//     const attendeeMap = new Map<string, {
//       userId?: string;
//       email: string;
//       name: string;
//       isExternal: boolean;
//     }>()

//     // 1. Add team members (if teamId provided)
//     if (teamId) {
//       const team = await prisma.team.findUnique({
//         where: { id: teamId },
//         include: {
//           members: {
//             include: { user: true }
//           }
//         }
//       })
//       if (team) {
//         for (const m of team.members) {
//           const email = m.user.email.toLowerCase().trim()
//           if (!attendeeMap.has(email)) {
//             attendeeMap.set(email, {
//               userId: m.user.id,
//               email: email,
//               name: m.user.name || email.split('@')[0],
//               isExternal: false,
//             })
//           }
//         }
//       }
//     } 
//     // 2. Add selected individual members
//     else if (selectedMemberIds && selectedMemberIds.length > 0) {
//       const members = await prisma.teamMember.findMany({
//         where: {
//           userId: { in: selectedMemberIds },
//         },
//         include: { user: true }
//       })
//       for (const m of members) {
//         const email = m.user.email.toLowerCase().trim()
//         if (!attendeeMap.has(email)) {
//           attendeeMap.set(email, {
//             userId: m.user.id,
//             email: email,
//             name: m.user.name || email.split('@')[0],
//             isExternal: false,
//           })
//         }
//       }
//     }

//     // 3. Add external attendees
//     const validatedExternalAttendees: { email: string; name: string }[] = []
//     if (externalAttendees && externalAttendees.length > 0) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//       for (const ext of externalAttendees) {
//         const email = ext.email.toLowerCase().trim()
//         if (emailRegex.test(email)) {
//           // Skip if already in map (duplicate check)
//           if (!attendeeMap.has(email)) {
//             const name = ext.name || email.split('@')[0]
//             attendeeMap.set(email, {
//               email: email,
//               name: name,
//               isExternal: true,
//             })
//             validatedExternalAttendees.push({ email, name })
//           }
//         }
//       }
//     }

//     // Convert Map to array
//     const allAttendees = Array.from(attendeeMap.values())

//     if (allAttendees.length === 0) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({ message: 'No attendees selected' })
//     }

//     console.log(`Creating meeting with ${allAttendees.length} unique attendees:`, 
//       allAttendees.map(a => ({ email: a.email, isExternal: a.isExternal })))

//     // ═══════════════════════════════════════════════════════════════════

//     // Create Google Meet link with all attendees
//     // let meetLink = ''
//     // let calendarEventId = ''
    
//     // if (event.locationType === EventLocationType.GOOGLE_MEET_AND_CALENDAR) {
//     //   const integration = await prisma.integration.findFirst({
//     //     where: {
//     //       userId: user.id,
//     //       appType: IntegrationAppType.GOOGLE_MEET_AND_CALENDAR,
//     //     },
//     //   })

//     //   if (integration) {
//     //     googleCalendarClient.setCredentials({
//     //       access_token: integration.accessToken,
//     //       refresh_token: integration.refreshToken,
//     //     })

//     //     const calendar = google.calendar({ version: 'v3', auth: googleCalendarClient })
        
//     //     const attendeeEmails = allAttendees.map(a => ({ email: a.email }))
//     //     attendeeEmails.push({ email: user.email })

//     //     const calendarEvent = await calendar.events.insert({
//     //       calendarId: 'primary',
//     //       conferenceDataVersion: 1,
//     //       requestBody: {
//     //         summary: title || event.title,
//     //         description: description || event.description,
//     //         start: { dateTime: new Date(startTime).toISOString() },
//     //         end: { dateTime: new Date(endTime).toISOString() },
//     //         attendees: attendeeEmails,
//     //         conferenceData: {
//     //           createRequest: {
//     //             requestId: `${event.id}-${Date.now()}`,
//     //           },
//     //         },
//     //       },
//     //     })

//     //     meetLink = calendarEvent.data.hangoutLink || ''
//     //     calendarEventId = calendarEvent.data.id || ''
//     //   }
//     // }

//         let meetLink = ''
//     let calendarEventId = ''
//     let externalMeetingId: string | null = null
//     let calendarAppType = ''

//     const locationType = event.locationType as string

//     // CONFERIO
//     if (locationType === "CONFERIO" || locationType === EventLocationType.CONFERIO) {
//       const conferioMeeting = await createConferioMeeting({
//         title: title || event.title,
//         hostEmail: user.email,
//         duration: event.duration,
//       })
      
//       meetLink = conferioMeeting.joinUrl
//       externalMeetingId = conferioMeeting.roomId
//       calendarAppType = "CONFERIO"
//     }

//     // ZOOM
//     else if (locationType === "ZOOM_MEETING" || locationType === EventLocationType.ZOOM_MEETING) {
//       const zoomIntegration = await prisma.integration.findFirst({
//         where: {
//           userId: user.id,
//           appType: IntegrationAppType.ZOOM_MEETING,
//         },
//       })

//       const hostEmail = zoomIntegration?.metadata?.hostEmail as string | undefined

//       const zoomMeeting = await createZoomMeeting({
//         topic: title || event.title,
//         startTime: new Date(startTime),
//         duration: event.duration,
//         hostEmail,
//       })

//       meetLink = zoomMeeting.joinUrl
//       externalMeetingId = zoomMeeting.id
//       calendarAppType = "ZOOM_MEETING"
//     }

//     // GOOGLE MEET & CALENDAR
//     else if (locationType === "GOOGLE_MEET_AND_CALENDAR" || locationType === EventLocationType.GOOGLE_MEET_AND_CALENDAR) {
//       const integration = await prisma.integration.findFirst({
//         where: {
//           userId: user.id,
//           appType: IntegrationAppType.GOOGLE_MEET_AND_CALENDAR,
//         },
//       })

//       if (integration) {
//         googleCalendarClient.setCredentials({
//           access_token: integration.accessToken,
//           refresh_token: integration.refreshToken,
//         })

//         const calendar = google.calendar({ version: 'v3', auth: googleCalendarClient })
        
//         const attendeeEmails = allAttendees.map(a => ({ email: a.email }))
//         attendeeEmails.push({ email: user.email })

//         const calendarEvent = await calendar.events.insert({
//           calendarId: 'primary',
//           conferenceDataVersion: 1,
//           requestBody: {
//             summary: title || event.title,
//             description: description || event.description,
//             start: { dateTime: new Date(startTime).toISOString() },
//             end: { dateTime: new Date(endTime).toISOString() },
//             attendees: attendeeEmails,
//             conferenceData: {
//               createRequest: {
//                 requestId: `${event.id}-${Date.now()}`,
//               },
//             },
//           },
//         })

//         meetLink = calendarEvent.data.hangoutLink || ''
//         calendarEventId = calendarEvent.data.id || ''
//         calendarAppType = "GOOGLE_MEET_AND_CALENDAR"
//       }
//     }

//     else {
//       throw new BadRequestException(`Unsupported location type: ${locationType}`)
//     }

//     // Create meeting with attendees
//     // const meeting = await prisma.meeting.create({
//     //   data: {
//     //     eventId: event.id,
//     //     userId: user.id,
//     //     guestName: allAttendees[0]?.name || 'Team Meeting',
//     //     guestEmail: allAttendees[0]?.email || 'team@meeting.com',
//     //     additionalInfo: description,
//     //     startTime: new Date(startTime),
//     //     endTime: new Date(endTime),
//     //     meetLink,
//     //     calendarEventId,
//     //     calendarAppType: event.locationType,
//     //     status: MeetingStatus.SCHEDULED,
//     //     meetingAttendees: {
//     //       create: allAttendees.map(att => ({
//     //         userId: att.userId || null,
//     //         email: att.email,
//     //         name: att.name,
//     //         isExternal: att.isExternal,
//     //         status: 'pending',
//     //       })),
//     //     },
//     //     teamMeetingLink: teamId ? {
//     //       create: {
//     //         teamId,
//     //         shareToken: createId(),
//     //       }
//     //     } : undefined,
//     //   },
//     //   include: {
//     //     meetingAttendees: true,
//     //     teamMeetingLink: true,
//     //     event: true,
//     //   },
//     // })
//         const meeting = await prisma.meeting.create({
//       data: {
//         eventId: event.id,
//         userId: user.id,
//         guestName: allAttendees[0]?.name || 'Team Meeting',
//         guestEmail: allAttendees[0]?.email || 'team@meeting.com',
//         additionalInfo: description,
//         startTime: new Date(startTime),
//         endTime: new Date(endTime),
//         meetLink,
//         calendarEventId,
//         calendarAppType,
//         status: MeetingStatus.SCHEDULED,
//         ...(externalMeetingId ? {
//           metadata: { externalMeetingId }
//         } : {}),
//         meetingAttendees: {
//           create: allAttendees.map(att => ({
//             userId: att.userId || null,
//             email: att.email,
//             name: att.name,
//             isExternal: att.isExternal,
//             status: 'pending',
//           })),
//         },
//         teamMeetingLink: teamId ? {
//           create: {
//             teamId,
//             shareToken: createId(),
//           }
//         } : undefined,
//       },
//       include: {
//         meetingAttendees: true,
//         teamMeetingLink: true,
//         event: true,
//       },
//     })

//     // Send emails to external attendees
//     const teamName = teamId ? (await prisma.team.findUnique({ where: { id: teamId } }))?.name : undefined
    
//     const emailPromises = validatedExternalAttendees.map(async (externalAttendee) => {
//       try {
//         const emailContent = generateEmailContent({
//           meetingTitle: title || event.title,
//           organizerName: user.name || user.email,
//           startTime: new Date(startTime).toLocaleString('en-US', {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             hour: 'numeric',
//             minute: '2-digit',
//             timeZoneName: 'short'
//           }),
//           endTime,
//           meetLink,
//           teamName,
//           description
//         })

//         await sendEmail({
//           to: externalAttendee.email,
//           subject: emailContent.subject,
//           html: emailContent.html,
//         })

//         console.log(`✉️ Invitation email sent to external attendee: ${externalAttendee.email}`)
//         return { success: true, email: externalAttendee.email }
        
//       } catch (emailError) {
//         console.error(`❌ Failed to send email to ${externalAttendee.email}:`, emailError)
//         return { success: false, email: externalAttendee.email, error: emailError }
//       }
//     })

//     const emailResults = await Promise.allSettled(emailPromises)
//     const successfulEmails = emailResults.filter(
//       r => r.status === 'fulfilled' && r.value.success
//     ).length

//     console.log(`Meeting created with ${allAttendees.length} attendees. Emails sent: ${successfulEmails}/${validatedExternalAttendees.length}`)
// const internalAttendeeUserIds = allAttendees
//   .filter(a => !a.isExternal && a.userId && a.userId !== user.id)
//   .map(a => a.userId!)

// if (internalAttendeeUserIds.length > 0) {
//   await notifyMeetingScheduled({
//     attendeeUserIds: internalAttendeeUserIds,
//     organizerName: user.name ?? user.email ?? 'Someone',
//     meetingId: meeting.id,
//     meetingTitle: title || event.title,
//     startTime: new Date(startTime),
//     endTime: new Date(endTime),
//     meetLink,
//   })

//   for (const uid of internalAttendeeUserIds) {
//     const notification = await prisma.notification.findFirst({
//       where: { userId: uid, meetingId: meeting.id, type: 'MEETING_SCHEDULED' },
//       orderBy: { createdAt: 'desc' },
//     })
//     if (notification) {
//       broadcastToUser(uid, { type: 'notification', notification })
//     }
//   }
// }
//     return res.status(HTTPSTATUS.CREATED).json({
//       message: 'Team meeting scheduled successfully',
//       data: {
//         meeting,
//         attendeeCount: allAttendees.length,
//         externalAttendeesInvited: validatedExternalAttendees.length,
//         emailsSent: successfulEmails,
//         shareLink: meeting.teamMeetingLink?.shareToken 
//           ? `${process.env.NEXT_PUBLIC_APP_URL}/meetings/join/${meeting.teamMeetingLink.shareToken}`
//           : null,
//       },
//     })

//   } catch (error: any) {
//     console.error('Error creating team meeting:', error)
//     return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//       message: error.message || 'Internal server error',
//     })
//   }
// }
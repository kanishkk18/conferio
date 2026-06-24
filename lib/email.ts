// // lib/email.ts
// import nodemailer from 'nodemailer';

// // Create reusable transporter
// const createTransporter = () => {
//   // Check if SMTP is configured
//   if (!process.env.SMTP_HOST) {
//     return null;
//   }

//   return nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: parseInt(process.env.SMTP_PORT || '587'),
//     secure: process.env.SMTP_SECURE === 'true',
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
// };

// export const sendMeetingInvitation = async ({
//   to,
//   meetingTitle,
//   startTime,
//   endTime,
//   meetLink,
//   hostName,
//   description,
// }: {
//   to: string;
//   meetingTitle: string;
//   startTime: Date;
//   endTime: Date;
//   meetLink?: string;
//   hostName?: string;
//   description?: string;
// }) => {
//   const transporter = createTransporter();
  
//   if (!transporter) {
//     console.log('Email not configured. Would have sent to:', to);
//     return;
//   }

//   const mailOptions = {
//     from: process.env.FROM_EMAIL || '"Conferio" <meetings@conferio.app>',
//     to,
//     subject: `Meeting Invitation: ${meetingTitle}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #333;">You've been invited to a meeting</h2>
        
//         <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="margin-top: 0; color: #0066cc;">${meetingTitle}</h3>
          
//           <p><strong>📅 Date:</strong> ${new Date(startTime).toLocaleDateString()}</p>
//           <p><strong>🕐 Time:</strong> ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()}</p>
//           ${hostName ? `<p><strong>👤 Host:</strong> ${hostName}</p>` : ''}
          
//           ${meetLink ? `
//             <div style="margin: 20px 0;">
//               <a href="${meetLink}" 
//                  style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
//                 Join Meeting
//               </a>
//             </div>
//             <p style="font-size: 12px; color: #666;">Or copy this link: ${meetLink}</p>
//           ` : ''}
          
//           ${description ? `<p><strong>📝 Details:</strong> ${description}</p>` : ''}
//         </div>
        
//         <p style="color: #666; font-size: 12px;">
//           This meeting was scheduled using Conferio. 
//           Please add this event to your calendar.
//         </p>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// // Default export for compatibility
// export default {
//   sendMeetingInvitation,
// };

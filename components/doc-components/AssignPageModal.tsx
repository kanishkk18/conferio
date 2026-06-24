
// 'use client'

// import { useEffect, useState } from 'react'
// import { UserPlus, X, Users, Search } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { toast } from 'sonner'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Badge } from '@/components/ui/badge'

// interface TeamMember {
//   id: string
//   role: string
//   user: {
//     id: string
//     name: string
//     email: string
//     image?: string
//   }
//   team: {
//     id: string
//     name: string
//   }
// }

// interface Team {
//   id: string
//   name: string
//   members: TeamMember[]
// }

// interface AssignPageModalProps {
//   pageId: string
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onAssigned?: () => void
// }

// export default function AssignPageModal({ pageId, open, onOpenChange, onAssigned }: AssignPageModalProps) {
//   const [teams, setTeams] = useState<Team[]>([])
//   const [loading, setLoading] = useState(true)
//   const [assigning, setAssigning] = useState<string | null>(null)
//   const [searchQuery, setSearchQuery] = useState('')

//   useEffect(() => {
//     if (open) {
//       fetchTeamsAndMembers()
//     }
//   }, [open])

//   const fetchTeamsAndMembers = async () => {
//     try {
//       // Get user's teams
//       const teamsRes = await fetch('/api/teams')
//       if (!teamsRes.ok) throw new Error('Failed to fetch teams')
//       const teamsData = await teamsRes.json()

//       // For each team, get members
//       const teamsWithMembers = await Promise.all(
//         teamsData.map(async (team: any) => {
//           const membersRes = await fetch(`/api/teams/team/${team.id}/members`)
//           if (!membersRes.ok) return { ...team, members: [] }
//           const members = await membersRes.json()
//           return { ...team, members }
//         })
//       )

//       setTeams(teamsWithMembers)
//     } catch (error) {
//       console.error('Error fetching teams:', error)
//       toast.error('Failed to load teams')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAssign = async (teamMemberId: string, teamId: string) => {
//     setAssigning(teamMemberId)
//     try {
//       const response = await fetch(`/api/pages/${pageId}/assign`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ teamMemberId, teamId }),
//       })

//       if (response.ok) {
//         toast.success('Page assigned successfully')
//         onAssigned?.()
//         onOpenChange(false)
//       } else {
//         throw new Error('Failed to assign page')
//       }
//     } catch (error) {
//       toast.error('Failed to assign page')
//     } finally {
//       setAssigning(null)
//     }
//   }

//   const filteredTeams = teams.map(team => ({
//     ...team,
//     members: team.members.filter(member => 
//       member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//   })).filter(team => team.members.length > 0)

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <UserPlus className="size-5" />
//             Assign Page
//           </DialogTitle>
//           <DialogDescription>
//             Assign this page to a team member
//           </DialogDescription>
//         </DialogHeader>

//         <div className="mt-4 space-y-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
//             <Input
//               placeholder="Search members..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9"
//             />
//           </div>

//           {loading ? (
//             <div className="py-8 text-center text-sm text-gray-500">
//               Loading teams...
//             </div>
//           ) : filteredTeams.length === 0 ? (
//             <div className="py-8 text-center text-sm text-gray-500">
//               No teams or members found
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {filteredTeams.map((team) => (
//                 <div key={team.id}>
//                   <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
//                     <Users className="size-4" />
//                     {team.name}
//                   </h4>
//                   <div className="space-y-1">
//                     {team.members.map((member) => (
//                       <button type="button"
//                         key={member.id}
//                         onClick={() => handleAssign(member.id, team.id)}
//                         disabled={assigning === member.id}
//                         className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
//                       >
//                         <Avatar className="h-8 w-8">
//                           <AvatarImage src={member.user.image} />
//                           <AvatarFallback>
//                             {member.user.name?.charAt(0) || member.user.email.charAt(0)}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className="flex-1 min-w-0">
//                           <div className="text-sm font-medium truncate">
//                             {member.user.name || 'Unknown'}
//                           </div>
//                           <div className="text-xs text-gray-500 truncate">
//                             {member.user.email}
//                           </div>
//                         </div>
//                         <Badge variant="secondary" className="text-xs">
//                           {member.role}
//                         </Badge>
//                         {assigning === member.id && (
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { UserPlus, X, Users, Search, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TeamMember {
  id: string
  teamMemberId: string
  name: string
  email: string
  image?: string
  role: string
}

interface Team {
  id: string
  name: string
  slug: string
  members: TeamMember[]
}

interface AssignPageModalProps {
  pageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssigned?: () => void
}

export default function AssignPageModal({ pageId, open, onOpenChange, onAssigned }: AssignPageModalProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('members')

  useEffect(() => {
    if (open) {
      fetchTeamsAndMembers()
    }
  }, [open])

  const fetchTeamsAndMembers = async () => {
    try {
      // Get user's teams - handle both array and { data: [...] } formats
      const teamsRes = await fetch('/api/teams')
      if (!teamsRes.ok) throw new Error('Failed to fetch teams')
      
      let teamsData = await teamsRes.json()
      
      // Handle if API returns { data: [...] } format
      if (teamsData.data && Array.isArray(teamsData.data)) {
        teamsData = teamsData.data
      } else if (!Array.isArray(teamsData)) {
        // If it's an object but no data property, try to extract teams
        teamsData = Object.values(teamsData).find(val => Array.isArray(val)) || []
      }

      // For each team, get members using your existing endpoint
      const teamsWithMembers = await Promise.all(
        teamsData.map(async (team: any) => {
          try {
            // Use your existing endpoint: /api/teams/[slug]/members-for-selection
            const membersRes = await fetch(`/api/teams/${team.slug}/members-for-selection`)
            if (!membersRes.ok) return { ...team, members: [] }
            
            const result = await membersRes.json()
            // Handle your API format: { data: { team, members } }
            const members = result.data?.members || result.members || []
            
            return { 
              ...team, 
              members: members.map((m: any) => ({
                ...m,
                teamMemberId: m.teamMemberId || m.id,
              }))
            }
          } catch (error) {
            console.error(`Error fetching members for team ${team.id}:`, error)
            return { ...team, members: [] }
          }
        })
      )

      setTeams(teamsWithMembers.filter(t => t.members.length > 0))
      
      // Auto-select first team if available
      if (teamsWithMembers.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsWithMembers[0].id)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignToMember = async (teamMemberId: string, teamId: string) => {
    setAssigning(teamMemberId)
    try {
      const response = await fetch(`/api/pages/${pageId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teamMemberId, 
          teamId,
          assignType: 'member'
        }),
      })

      if (response.ok) {
        toast.success('Page assigned to team member')
        onAssigned?.()
        onOpenChange(false)
      } else {
        throw new Error('Failed to assign page')
      }
    } catch (error) {
      toast.error('Failed to assign page')
    } finally {
      setAssigning(null)
    }
  }

  const handleAssignToTeam = async (teamId: string) => {
    setAssigning(`team-${teamId}`)
    try {
      const response = await fetch(`/api/pages/${pageId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teamId,
          assignType: 'team'
        }),
      })

      if (response.ok) {
        toast.success('Page assigned to entire team')
        onAssigned?.()
        onOpenChange(false)
      } else {
        throw new Error('Failed to assign page')
      }
    } catch (error) {
      toast.error('Failed to assign page')
    } finally {
      setAssigning(null)
    }
  }

  const currentTeam = teams.find(t => t.id === selectedTeam)
  
  const filteredMembers = currentTeam?.members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Assign Page
          </DialogTitle>
          <DialogDescription>
            Assign this page to a team or specific team member
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="size-4" />
              Team Member
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Building2 className="size-4" />
              Entire Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4 space-y-4">
            {/* Team Selection */}
            {teams.length > 1 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Select Team</div>
                <div className="flex flex-wrap gap-2">
                  {teams.map((team) => (
                    <button type="button"
                      key={team.id}
                      onClick={() => setSelectedTeam(team.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedTeam === team.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {team.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Members List */}
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading members&hellip;
                </div>
              ) : !currentTeam ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No team selected
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No members found
                </div>
              ) : (
                <div className="space-y-1 pr-4">
                  {filteredMembers.map((member) => (
                    <button type="button"
                      key={member.teamMemberId}
                      onClick={() => handleAssignToMember(member.teamMemberId, currentTeam.id)}
                      disabled={assigning === member.teamMemberId}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left border"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.image} />
                        <AvatarFallback>
                          {member.name?.charAt(0) || member.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {member.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {member.email}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {member.role}
                      </Badge>
                      {assigning === member.teamMemberId && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="team" className="mt-4 space-y-4">
            {/* Search Teams */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Teams List */}
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading teams&hellip;
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No teams found
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {filteredTeams.map((team) => (
                    <button type="button"
                      key={team.id}
                      onClick={() => handleAssignToTeam(team.id)}
                      disabled={assigning === `team-${team.id}`}
                      className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-secondary transition-colors text-left border"
                    >
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {team.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {team.members.length} members
                        </div>
                      </div>
                      {assigning === `team-${team.id}` ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      ) : (
                        <Check className="size-5 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}



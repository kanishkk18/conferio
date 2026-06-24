// 'use client'

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle , ModalBody } from '@/components/ui/animated-modal'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Badge } from '@/components/ui/badge'
// import { Users, Mail, Trash2 } from 'lucide-react'
// import { toast } from 'sonner'

// interface Member {
//   id: string
//   role: string
//   user: {
//     id: string
//     name: string
//     email: string
//     image?: string
//   }
// }

// interface InviteModalProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   workspaceId: string
//   members: Member[]
//   onMembersUpdate: () => void
// }

// export default function InviteModal({ open, onOpenChange, workspaceId, members, onMembersUpdate }: InviteModalProps) {
//   const [email, setEmail] = useState('')
//   const [role, setRole] = useState('VIEWER')
//   const [loading, setLoading] = useState(false)

//   const handleInvite = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!email.trim()) return

//     setLoading(true)
//     try {
//       const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: email.trim(), role }),
//       })

//       if (response.ok) {
//         toast.success('User invited successfully')
//         setEmail('')
//         setRole('VIEWER')
//         onMembersUpdate()
//       } else {
//         const error = await response.json()
//         toast.error(error.error || 'Failed to invite user')
//       }
//     } catch (error) {
//       toast.error('Failed to invite user')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleRemoveMember = async (memberId: string) => {
//     try {
//       const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
//         method: 'DELETE',
//       })

//       if (response.ok) {
//         toast.success('Member removed successfully')
//         onMembersUpdate()
//       } else {
//         toast.error('Failed to remove member')
//       }
//     } catch (error) {
//       toast.error('Failed to remove member')
//     }
//   }

//   const getRoleBadgeColor = (role: string) => {
//     switch (role) {
//       case 'OWNER': return 'bg-purple-100 text-purple-800'
//       case 'ADMIN': return 'bg-blue-100 text-blue-800'
//       case 'EDITOR': return 'bg-green-100 text-green-800'
//       case 'COMMENTER': return 'bg-yellow-100 text-yellow-800'
//       default: return 'bg-gray-100 text-gray-800'
//     }
//   }

//   return (
//     <Modal open={open} onOpenChange={onOpenChange}>
//       <ModalBody>
//       <ModalContent className="max-w-md">
//         <ModalHeader>
//           <ModalTitle className="flex items-center">
//             <Users className="mr-2 h-5 w-5" />
//             Invite to Workspace
//           </ModalTitle>
//           <ModalDescription>
//             Add team members to collaborate on this workspace
//           </ModalDescription>
//         </ModalHeader>

//         <form onSubmit={handleInvite} className="space-y-4">
//           <div>
//             <Label htmlFor="email">Email address</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="colleague@company.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <Label htmlFor="role">Role</Label>
//             <Select value={role} onValueChange={setRole}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="VIEWER">Viewer - Can view pages</SelectItem>
//                 <SelectItem value="COMMENTER">Commenter - Can view and comment</SelectItem>
//                 <SelectItem value="EDITOR">Editor - Can edit pages</SelectItem>
//                 <SelectItem value="ADMIN">Admin - Can manage workspace</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <Button type="submit" className="w-full" disabled={loading}>
//             <Mail className="mr-2 h-4 w-4" />
//             {loading ? 'Inviting&hellip;' : 'Send Invitation'}
//           </Button>
//         </form>

//         <div className="mt-6">
//           <h4 className="text-sm font-medium mb-3">Current Members ({members.length})</h4>
//           <div className="space-y-2 max-h-48 overflow-y-auto">
//             {members.map((member) => (
//               <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border">
//                 <div className="flex items-center gap-x-3">
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage src={member.user.image} />
//                     <AvatarFallback>
//                       {member.user.name?.charAt(0) || member.user.email.charAt(0)}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <div className="text-sm font-medium">{member.user.name || 'Unknown'}</div>
//                     <div className="text-xs text-gray-500">{member.user.email}</div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-x-2">
//                   <Badge className={getRoleBadgeColor(member.role)}>
//                     {member.role}
//                   </Badge>
//                   {member.role !== 'OWNER' && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleRemoveMember(member.id)}
//                       className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
//                     >
//                       <Trash2 className="h-3 w-3" />
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </ModalContent>
//       </ModalBody>
//     </Modal>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalBody } from '@/components/ui/animated-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Trash2, Search, Building2, UserPlus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'

interface Member {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

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

interface InviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  members: Member[]
  onMembersUpdate: () => void
}

export default function InviteModal({ open, onOpenChange, workspaceId, members, onMembersUpdate }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('VIEWER')
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('email')
  const [fetchingTeams, setFetchingTeams] = useState(false)

  // Fetch teams when modal opens
  useEffect(() => {
    if (open) {
      fetchTeams()
    }
  }, [open])

  const fetchTeams = async () => {
    setFetchingTeams(true)
    try {
      const teamsRes = await fetch('/api/teams')
      if (!teamsRes.ok) throw new Error('Failed to fetch teams')
      
      let teamsData = await teamsRes.json()
      
      // Handle { data: [...] } format
      if (teamsData.data && Array.isArray(teamsData.data)) {
        teamsData = teamsData.data
      } else if (!Array.isArray(teamsData)) {
        teamsData = Object.values(teamsData).find(val => Array.isArray(val)) || []
      }

      // Fetch members for each team using your existing endpoint
      const teamsWithMembers = await Promise.all(
        teamsData.map(async (team: any) => {
          try {
            const membersRes = await fetch(`/api/teams/${team.slug}/members-for-selection`)
            if (!membersRes.ok) return { ...team, members: [] }
            
            const result = await membersRes.json()
            const members = result.data?.members || result.members || []
            
            return { 
              ...team, 
              members: members.map((m: any) => ({
                ...m,
                teamMemberId: m.teamMemberId || m.id,
              }))
            }
          } catch (error) {
            return { ...team, members: [] }
          }
        })
      )

      setTeams(teamsWithMembers.filter(t => t.members.length > 0))
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setFetchingTeams(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })

      if (response.ok) {
        toast.success('User invited successfully')
        setEmail('')
        setRole('VIEWER')
        onMembersUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to invite user')
      }
    } catch (error) {
      toast.error('Failed to invite user')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteSelectedMembers = async () => {
    if (selectedTeamMembers.length === 0) {
      toast.error('Please select at least one member')
      return
    }

    setLoading(true)
    try {
      // Find selected members from all teams
      const membersToInvite: TeamMember[] = []
      teams.forEach(team => {
        team.members.forEach(member => {
          if (selectedTeamMembers.includes(member.teamMemberId)) {
            membersToInvite.push({ ...member, teamId: team.id })
          }
        })
      })

      // Invite each selected member
      const results = await Promise.all(
        membersToInvite.map(async (member) => {
          try {
            const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: member.email, 
                role,
                teamMemberId: member.teamMemberId,
                source: 'team'
              }),
            })
            return { email: member.email, success: response.ok }
          } catch (error) {
            return { email: member.email, success: false }
          }
        })
      )

      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        toast.success(`Invited ${successCount} member(s) successfully`)
      }
      if (failCount > 0) {
        toast.error(`Failed to invite ${failCount} member(s)`)
      }

      setSelectedTeamMembers([])
      onMembersUpdate()
    } catch (error) {
      toast.error('Failed to invite members')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Member removed successfully')
        onMembersUpdate()
      } else {
        toast.error('Failed to remove member')
      }
    } catch (error) {
      toast.error('Failed to remove member')
    }
  }

  const toggleMemberSelection = (teamMemberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(teamMemberId)
        ? prev.filter(id => id !== teamMemberId)
        : [...prev, teamMemberId]
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'EDITOR': return 'bg-green-100 text-green-800'
      case 'COMMENTER': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter members across all teams
  const allMembers = teams.flatMap(team => 
    team.members.map(m => ({ ...m, teamName: team.name }))
  )
  
  const filteredMembers = allMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalBody>
        <ModalContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <ModalHeader>
            <ModalTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Invite to Workspace
            </ModalTitle>
            <ModalDescription>
              Add team members to collaborate on this workspace
            </ModalDescription>
          </ModalHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="size-4" />
                By Email
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Building2 className="size-4" />
                From Team
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4 space-y-4">
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer - Can view pages</SelectItem>
                      <SelectItem value="COMMENTER">Commenter - Can view and comment</SelectItem>
                      <SelectItem value="EDITOR">Editor - Can edit pages</SelectItem>
                      <SelectItem value="ADMIN">Admin - Can manage workspace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? 'Inviting&hellip;' : 'Send Invitation'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="team" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Select Role for Team Members</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer - Can view pages</SelectItem>
                      <SelectItem value="COMMENTER">Commenter - Can view and comment</SelectItem>
                      <SelectItem value="EDITOR">Editor - Can edit pages</SelectItem>
                      <SelectItem value="ADMIN">Admin - Can manage workspace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                  <Input
                    placeholder="Search team members&hellip;"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {selectedTeamMembers.length > 0 && (
                  <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedTeamMembers.length} member(s) selected
                    </span>
                    <Button
                      size="sm"
                      onClick={handleInviteSelectedMembers}
                      disabled={loading}
                    >
                      <UserPlus className="size-4 mr-2" />
                      {loading ? 'Inviting&hellip;' : 'Invite Selected'}
                    </Button>
                  </div>
                )}

                <ScrollArea className="h-[300px]">
                  {fetchingTeams ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      Loading teams&hellip;
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No teams found. Create a team first.
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No members found matching your search.
                    </div>
                  ) : (
                    <div className="space-y-4 pr-4">
                      {teams.map((team) => {
                        const teamFilteredMembers = team.members.filter(member => 
                          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        
                        if (teamFilteredMembers.length === 0) return null
                        
                        return (
                          <div key={team.id}>
                            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                              <Building2 className="size-4" />
                              {team.name}
                            </h4>
                            <div className="space-y-1">
                              {teamFilteredMembers.map((member) => (
                                <div
                                  key={member.teamMemberId}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors border"
                                >
                                  <Checkbox
                                    checked={selectedTeamMembers.includes(member.teamMemberId)}
                                    onCheckedChange={() => toggleMemberSelection(member.teamMemberId)}
                                  />
                                  <Avatar className="h-8 w-8">
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
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Current Workspace Members ({members.length})</h4>
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.image} />
                        <AvatarFallback>
                          {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{member.user.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{member.user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                      {member.role !== 'OWNER' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ModalContent>
      </ModalBody>
    </Modal>
  )
}


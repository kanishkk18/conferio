// // src/pages/calls/index.tsx
// import React from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import CallHistory from '@/components/calls/CallHistory';
// import TeamMemberList from 'components/team/TeamMemberList';
// import IncomingCallModal from '@/components/calls/IncomingCallModal';
// import ActiveCall from '@/components/calls/ActiveCall';
// import { useCall } from 'contexts/CallContext';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Phone, Users, History } from 'lucide-react';

// export default function CallsPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { isInCall, incomingCall } = useCall();

//   if (status === 'loading') {
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-950">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (!session) {
//     router.push('/auth/signin');
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100">
//       {/* Modals */}
//       {incomingCall && <IncomingCallModal />}
//       {isInCall && <ActiveCall />}

//       <div className="mx-auto max-w-7xl p-6">
//         <header className="mb-8">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//             Voice & Video Calls
//           </h1>
//           <p className="mt-2 text-gray-400">
//             Connect with your team members and view call history
//           </p>
//         </header>

//         <Tabs defaultValue="team" className="space-y-6">
//           <TabsList className="bg-gray-900 border border-gray-800">
//             <TabsTrigger value="team" className="data-[state=active]:bg-gray-800">
//               <Users className="mr-2 h-4 w-4" />
//               Team Members
//             </TabsTrigger>
//             <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">
//               <History className="mr-2 h-4 w-4" />
//               Call History
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="team" className="space-y-4">
//             <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-6">
//               <h2 className="mb-4 text-xl font-semibold text-white">Available Team Members</h2>
//               <TeamMemberList />
//             </div>
//           </TabsContent>

//           <TabsContent value="history" className="space-y-4">
//             <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-6">
//               <h2 className="mb-4 text-xl font-semibold text-white">Recent Calls</h2>
//               <CallHistory />
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }

// // src/pages/calls/index.tsx
// import React from 'react';
// import TeamMemberList from '@/components/team/TeamMemberList';
// import CallHistory from '@/components/calls/CallHistory';
// import IncomingCallModal from '@/components/calls/IncomingCallModal';
// import ActiveCall from '@/components/calls/ActiveCall';
// import { useCall } from 'contexts/CallContext';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Users, History, Phone } from 'lucide-react';

// export default function CallsPage() {
//   const { isInCall, incomingCall } = useCall();

//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
//       {incomingCall && <IncomingCallModal />}
//       {isInCall && <ActiveCall />}

//       <div className="mx-auto max-w-6xl">
//         <header className="mb-8 flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
//             <Phone className="h-5 w-5 text-blue-400" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-white">Voice & Video Calls</h1>
//             <p className="text-sm text-gray-400">
//               Call your team members and view history
//             </p>
//           </div>
//         </header>

//         <Tabs defaultValue="members" className="space-y-6">
//           <TabsList className="bg-gray-900 border border-gray-800">
//             <TabsTrigger value="members" className="data-[state=active]:bg-gray-800">
//               <Users className="mr-2 h-4 w-4" />
//               Team Members
//             </TabsTrigger>
//             <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">
//               <History className="mr-2 h-4 w-4" />
//               Call History
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="members" className="space-y-4">
//             <TeamMemberList />
//           </TabsContent>

//           <TabsContent value="history" className="space-y-4">
//             <CallHistory />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }

// import React from 'react';
// import TeamMemberList from '@/components/team/TeamMemberList';
// import CallHistory from '@/components/calls/CallHistory';
// import IncomingCallModal from '@/components/calls/IncomingCallModal';
// import ActiveCall from '@/components/calls/ActiveCall';
// import { useCall } from 'contexts/CallContext';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Users, History, Phone } from 'lucide-react';

// export default function CallsPage() {
//   const { isInCall, isCalling, incomingCall } = useCall();

//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
//       {/* Show incoming call modal */}
//       {incomingCall && <IncomingCallModal />}

//       {/* Show active call UI for both caller (isCalling) and callee (isInCall) */}
//       {(isInCall || isCalling) && <ActiveCall />}

//       <div className="mx-auto max-w-6xl">
//         <header className="mb-8 flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
//             <Phone className="h-5 w-5 text-blue-400" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-white">Voice & Video Calls</h1>
//             <p className="text-sm text-gray-400">
//               Call your team members and view history
//             </p>
//           </div>
//         </header>

//         <Tabs defaultValue="members" className="space-y-6">
//           <TabsList className="bg-gray-900 border border-gray-800">
//             <TabsTrigger value="members" className="data-[state=active]:bg-gray-800">
//               <Users className="mr-2 h-4 w-4" />
//               Team Members
//             </TabsTrigger>
//             <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">
//               <History className="mr-2 h-4 w-4" />
//               Call History
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="members" className="space-y-4">
//             <TeamMemberList />
//           </TabsContent>

//           <TabsContent value="history" className="space-y-4">
//             <CallHistory />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }


import React, { useEffect } from 'react';
import TeamMemberList from '@/components/team/TeamMemberList';
import CallHistory from '@/components/calls/CallHistory';
import IncomingCallModal from 'components/calls/IncomingCallModal';
import { useCall } from 'contexts/CallContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, History, Phone } from 'lucide-react';
import Mainsidebar from '@/components/ui/mainSideBar';
import { Header } from '@/components/doc-components/Header';

export default function CallsPage() {
  const { isInCall, incomingCall, currentCall } = useCall();

  // Debug logging
  useEffect(() => {
    console.log('[CALLS PAGE] State:', { isInCall, incomingCall, currentCall });
  }, [isInCall, incomingCall, currentCall]);

  return (
    <div className="h-screen flex items-center w-full bg-white dark:bg-[#000] overflow-hidden !max-h-screen">
      <Mainsidebar/>

      <div className="w-full h-full py-0 overflow-y-auto scrollbar-thin2">
        <Header/>
      {/* Show incoming call modal */}
      {incomingCall && !isInCall && <IncomingCallModal />}

      {/* Show active call UI for both caller and callee */}
      {/* {(isInCall || isCalling) && currentCall && (
        <ActiveCall key={currentCall.id} />
      )} */}

      <Tabs defaultValue="members" className="mx-auto max-w-full px-6">
        

        <div className=" flex justify-between items-start mb-6 mt-4">
         
         <header className=" flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
            <Phone className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold dark:text-white">Voice & Video Calls</h1>
            <p className="text-sm text-gray-400">
              Call your team members and view history
            </p>
          </div>
        </header>

         <TabsList className="bg-white dark:bg-[#111] border dark:border-[#333]">
            <TabsTrigger value="members" className="data-[state=active]:dark:bg-gray-800">
              <Users className="mr-2 h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:dark:bg-gray-800">
              <History className="mr-2 h-4 w-4" />
              Call History
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="members" className="space-y-4">
            <TeamMemberList />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <CallHistory />
          </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
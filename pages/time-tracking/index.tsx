// pages/time-tracking/index.tsx
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// import { TimerWidget } from '@/components/time-tracking/TimerWidget';
import { Timesheet } from '@/components/time-tracking/Timesheet';
import { TeamTimesheet } from '@/components/time-tracking/TeamTimesheet';
// import { ManualTimeEntry } from '@/components/time-tracking/ManualTimeEntry';
import { Plus, Users, User, Clock } from 'lucide-react';
import Mainsidebar from '@/components/ui/mainSideBar';
import { Header } from '@/components/doc-components/Header';
import ClickCard from '@/components/ui/ClickCard';
import { TimeEntryWidget } from '@/components/time-tracking/TimeEntryModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { UsersIcon } from '@/components/animate-ui/icons/users';
import { UserIcon } from '@/components/animate-ui/icons/user';

interface TimeTrackingPageProps {
  isAdmin: boolean;
  isOwner: boolean;
}

export default function TimeTrackingPage({ isAdmin, isOwner }: TimeTrackingPageProps) {
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEntryComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const canViewTeam = isAdmin || isOwner;

  return (
    <div className="h-screen max-h-screen flex dark:bg-[#090909] bg-[#F9F9F9] !overflow-y-hidden">
      <Mainsidebar />

      <div className="w-full mx-auto overflow-y-auto scrollbar-thin2">
        {/* Header */}
        <div className="">
          <Header />
        </div>
        <div className="mb-4 px-3 dark:bg-[#111111] bg-[#fff]">
          <div className="flex items-center justify-between">
            <div>
              {canViewTeam && (
                  <Tabs className="flex !justify-between items-center pb-0 pt-2 px-4">
              <TabsList className="mb-1 h-auto gap-2 rounded-none !bg-transparent px-0 py-1 text-foreground">
               <AnimateIcon animateOnHover> <TabsTrigger
                onClick={() => setActiveTab('my')}
                  value="all"
                  className="relative dark:text-[#7B7B7B] after:absolute bg-transparent border-none after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:after:bg-white data-[state=active]:hover:bg-accent"
                >
                 <UserIcon
                      className="-ms-0.5 dark:text-[#7B7B7B] "
                      aria-hidden="true"
                    /> Timesheet
                </TabsTrigger></AnimateIcon>
                <AnimateIcon animateOnHover>
                  <TabsTrigger
                  onClick={() => setActiveTab('team')}
                    value="video"
                    className="relative dark:text-[#7B7B7B] after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                  >
                    <UsersIcon
                      className="-ms-0.5 dark:text-[#7B7B7B] "
                      aria-hidden="true"
                    />
                    Team Timesheet
                   
                  </TabsTrigger>
                </AnimateIcon>
              </TabsList>
            </Tabs>
                
              )} </div>
            <TimeEntryWidget
              onEntryComplete={handleEntryComplete}
            />
          </div>
          
        </div>
        {/* Right Column - Timesheet */}
        <div className="px-6">
          {activeTab === 'my' ? (
            <Timesheet key={refreshKey} isAdmin={isAdmin || isOwner} />
          ) : (
            <TeamTimesheet />
          )}
        </div>
      </div>
      {/* <TimerWidget onEntryComplete={handleEntryComplete} />
      <ManualTimeEntry
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSuccess={handleEntryComplete}
      /> */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
  });

  return {
    props: {
      isAdmin: teamMember?.role === 'ADMIN',
      isOwner: teamMember?.role === 'OWNER',
    },
  };
};
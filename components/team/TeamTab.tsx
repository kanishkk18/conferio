// import {
//   Cog6ToothIcon,
//   DocumentMagnifyingGlassIcon,
//   KeyIcon,
//   PaperAirplaneIcon,
//   ShieldExclamationIcon,
//   UserPlusIcon,
//   BanknotesIcon,
// } from '@heroicons/react/24/outline';
// import type { Team } from '@prisma/client';
// import classNames from 'classnames';
// import useCanAccess from 'hooks/useCanAccess';
// import Link from 'next/link';
// import { TeamFeature } from 'types/index';

// interface TeamTabProps {
//   activeTab: string;
//   team: Team;
//   heading?: string;
//   teamFeatures: TeamFeature;
// }

// const TeamTab = ({ activeTab, team, heading, teamFeatures }: TeamTabProps) => {
//   const { canAccess } = useCanAccess();

//   const navigations = [
//     {
//       name: 'Settings',
//       href: `/teams/${team.slug}/settings`,
//       active: activeTab === 'settings',
//       icon: Cog6ToothIcon,
//     },
//   ];

//   if (canAccess('team_member', ['create', 'update', 'read', 'delete'])) {
//     navigations.push({
//       name: 'Members',
//       href: `/teams/${team.slug}/members`,
//       active: activeTab === 'members',
//       icon: UserPlusIcon,
//     });
//   }

//   if (
//     teamFeatures.sso &&
//     canAccess('team_sso', ['create', 'update', 'read', 'delete'])
//   ) {
//     navigations.push({
//       name: 'Single Sign-On',
//       href: `/teams/${team.slug}/sso`,
//       active: activeTab === 'sso',
//       icon: ShieldExclamationIcon,
//     });
//   }

//   if (
//     teamFeatures.dsync &&
//     canAccess('team_dsync', ['create', 'update', 'read', 'delete'])
//   ) {
//     navigations.push({
//       name: 'Directory Sync',
//       href: `/teams/${team.slug}/directory-sync`,
//       active: activeTab === 'directory-sync',
//       icon: UserPlusIcon,
//     });
//   }

//   if (
//     teamFeatures.auditLog &&
//     canAccess('team_audit_log', ['create', 'update', 'read', 'delete'])
//   ) {
//     navigations.push({
//       name: 'Audit Logs',
//       href: `/teams/${team.slug}/audit-logs`,
//       active: activeTab === 'audit-logs',
//       icon: DocumentMagnifyingGlassIcon,
//     });
//   }

//   // if (
//   //   teamFeatures.payments &&
//   //   canAccess('team_payments', ['create', 'update', 'read', 'delete'])
//   // ) {
//   //   navigations.push({
//   //     name: 'Billing',
//   //     href: `/teams/${team.slug}/billing`,
//   //     active: activeTab === 'payments',
//   //     icon: BanknotesIcon,
//   //   });
//   // }

//   if (
//     teamFeatures.webhook &&
//     canAccess('team_webhook', ['create', 'update', 'read', 'delete'])
//   ) {
//     navigations.push({
//       name: 'Webhooks',
//       href: `/teams/${team.slug}/webhooks`,
//       active: activeTab === 'webhooks',
//       icon: PaperAirplaneIcon,
//     });
//   }

//   if (
//     teamFeatures.apiKey &&
//     canAccess('team_api_key', ['create', 'update', 'read', 'delete'])
//   ) {
//     navigations.push({
//       name: 'API Keys',
//       href: `/teams/${team.slug}/api-keys`,
//       active: activeTab === 'api-keys',
//       icon: KeyIcon,
//     });
//   }

//   return (
//     <div className="flex flex-col pb-6">
//       <h2 className="text-xl font-semibold mb-2">
//         {heading ? heading : team.name}
//       </h2>
//       <nav
//         className=" flex flex-wrap border-b border-gray-300"
//         aria-label="Tabs"
//       >
//         {navigations.map((menu) => {
//           return (
//             <Link
//               href={menu.href}
//               key={menu.href}
//               className={classNames(
//                 'inline-flex items-center border-b-2 py-2 md-py-4 mr-5 text-sm font-medium',
//                 menu.active
//                   ? 'border-gray-900 text-gray-700 dark:text-gray-100'
//                   : 'border-transparent text-gray-500 hover:border-gray-300  hover:text-gray-700 hover:dark:text-gray-100'
//               )}
//             >
//               {menu.name}
//             </Link>
//           );
//         })}
//       </nav>
//     </div>
//   );
// };

// export default TeamTab;

// components/team/TeamTab.tsx
import {
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  KeyIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import type { Team } from '@prisma/client';
import classNames from 'classnames';
import useCanAccess from 'hooks/useCanAccess';
import Link from 'next/link';
import { TeamFeature } from 'types/index';

interface TeamTabProps {
  activeTab: string;
  team: Team;
  heading?: string;
  teamFeatures: TeamFeature;
}

const TeamTab = ({ activeTab, team, heading, teamFeatures }: TeamTabProps) => {
  const { canAccess } = useCanAccess();

  // Added an "Overview" tab to match your image, defaulting to settings
  const navigations = [
    {
      name: 'Overview',
      href: `/teams/${team.slug}/settings`, // Pointing to settings as default view
      active: activeTab === 'settings',
      icon: Cog6ToothIcon, // Replace with ChartBarIcon if you import it
    },
    {
      name: 'Settings',
      href: `/teams/${team.slug}/settings`,
      active: activeTab === 'settings',
      icon: Cog6ToothIcon,
    },
  ];

  if (canAccess('team_member', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'Team',
      href: `/teams/${team.slug}/members`,
      active: activeTab === 'members',
      icon: UsersIcon,
    });
  }

  if (teamFeatures.sso && canAccess('team_sso', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'SSO',
      href: `/teams/${team.slug}/sso`,
      active: activeTab === 'sso',
      icon: ShieldExclamationIcon,
    });
  }

  if (teamFeatures.dsync && canAccess('team_dsync', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'Directory Sync',
      href: `/teams/${team.slug}/directory-sync`,
      active: activeTab === 'directory-sync',
      icon: UserPlusIcon,
    });
  }

  if (teamFeatures.auditLog && canAccess('team_audit_log', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'Audit Logs',
      href: `/teams/${team.slug}/audit-logs`,
      active: activeTab === 'audit-logs',
      icon: DocumentMagnifyingGlassIcon,
    });
  }

  if (teamFeatures.webhook && canAccess('team_webhook', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'Webhooks',
      href: `/teams/${team.slug}/webhooks`,
      active: activeTab === 'webhooks',
      icon: PaperAirplaneIcon,
    });
  }

  if (teamFeatures.apiKey && canAccess('team_api_key', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'API Keys',
      href: `/teams/${team.slug}/api-keys`,
      active: activeTab === 'api-keys',
      icon: KeyIcon,
    });
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f0f] mb-6 -mx-6 -mt-6 px-6 pt-6">
      {/* Workspace Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {team.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {team.name}&apos;s Workspace
          </h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex gap-1" aria-label="Tabs">
        {navigations.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link
              href={menu.href}
              key={menu.href}
              className={classNames(
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                menu.active
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TeamTab;
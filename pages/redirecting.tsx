// "use client"

// import { Loading } from '@/components/shared';
// import { Cover } from '@/components/ui/cover';
// import useTeams from 'hooks/useTeams';
// import { GetServerSidePropsContext } from 'next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import { useRouter } from 'next/router';
// import { useEffect, useRef, useState } from 'react';
// import type { NextPageWithLayout } from 'types/next';

// type Phase = 'video' | 'wall' | 'redirecting';

// const Dashboard: NextPageWithLayout = () => {
//   const { push } = useRouter();
//   const { teams, isLoading } = useTeams(); // ✅ Fetches immediately on mount, not after video
//   const [phase, setPhase] = useState<Phase>('video');
//   const didRedirect = useRef(false);

//   const handleVideoEnded = () => {
//     setPhase('wall');
//   };

//   useEffect(() => {
//     if (phase !== 'wall') return;
//     if (didRedirect.current) return;

//     // ✅ If data is already ready, redirect immediately (no 1s wait)
//     if (!isLoading && teams !== undefined) {
//       didRedirect.current = true;
//       setPhase('redirecting');
//       push(teams.length > 0 ? '/dashboard' : '/teams?newTeam=true');
//       return;
//     }

//     // ✅ Only fallback-wait if data is still loading when video ends
//     const timer = setTimeout(() => {
//       if (didRedirect.current) return;
//       didRedirect.current = true;
//       setPhase('redirecting');
//       push(teams && teams.length > 0 ? '/dashboard' : '/teams?newTeam=true');
//     }, 800); // reduced safety fallback

//     return () => clearTimeout(timer);
//   }, [phase, isLoading, teams, push]);

//   return (
//     <div className="relative w-screen h-screen overflow-hidden bg-black" aria-label="Button">

//       <style jsx global>{`
//             .wall {
//               background: url(https://pub-08af51b0459743828032880ad678a4cf.r2.dev/manual-upload/82fe3ef47c4eace70c45aa1639de4fd8.jpg);
//               background-size: cover;
//               background-position: center;
//             }

//             .scene {
//               position: absolute;
//               top: 0;
//               left: 0;
//               width: 100%;
//               height: 100%;
//               perspective: 5px;
//               perspective-origin: 50% 50%;
//               overflow: hidden;
//             }

//             .wrap {
//               position: absolute;
//               top: 50%;
//               left: 50%;
//               width: 2000px;
//               height: 2000px;
//               margin-top: -1000px;
//               margin-left: -1000px;
//               transform-style: preserve-3d;
//               animation: move 12s infinite linear;
//               animation-fill-mode: forwards;
//             }

//             .wrap:nth-child(2) {
//               animation: move 12s infinite linear;
//               animation-delay: 6s;
//             }

//             .wall {
//               position: absolute;
//               top: 0;
//               left: 0;
//               width: 2000px;
//               height: 2000px;
//               opacity: 0;
//               animation: fade 12s infinite linear;
//             }

//             .wrap:nth-child(2) .wall {
//               animation-delay: 6s;
//             }

//             .wall-right {
//               transform: rotateY(90deg) translateZ(1000px);
//             }
//             .wall-right-right {
//               transform: rotateY(90deg) translateZ(1020px);
//             }
//             .wall-left {
//               transform: rotateY(-90deg) translateZ(1000px);
//             }
//             .wall-left-left {
//               transform: rotateY(-90deg) translateZ(1020px);
//             }
//             .wall-top {
//               transform: rotateX(90deg) translateZ(1000px);
//             }
//             .wall-bottom {
//               transform: rotateX(-90deg) translateZ(1000px);
//             }
//             .wall-back {
//               transform: rotateX(180deg) translateZ(1000px);
//             }
//             .wall-top-top {
//               transform: rotateX(90deg) translateZ(1020px);
//             }
//             .wall-bottom-bottom {
//               transform: rotateX(-90deg) translateZ(1020px);
//             }

//             @keyframes move {
//               0% {
//                 transform: translateZ(-500px) rotate(0deg);
//               }
//               100% {
//                 transform: translateZ(500px) rotate(0deg);
//               }
//             }

//             @keyframes fade {
//               0% {
//                 opacity: 0;
//               }
//               25% {
//                 opacity: 1;
//               }
//               75% {
//                 opacity: 1;
//               }
//               100% {
//                 opacity: 0;
//               }
//             }
//           `}</style> 
          
//       {phase === 'video' && (
//         <video
//           aria-label="video"
//           autoPlay
//           muted
//           playsInline
//           onEnded={handleVideoEnded}
//           className="absolute inset-0 w-full h-full object-cover"
//           src="/rocket_launch.mp4" 
//         />
//       )}

//       {(phase === 'wall' || phase === 'redirecting') && (
//         <div className="relative w-full h-full overflow-hidden" aria-label="Button">
        

//           <div className="scene" aria-label="Button">
//             <div className="wrap" aria-label="Button">
//               <div className="wall wall-right"></div>
//               <div className="wall wall-right-right"></div>
//               <div className="wall wall-left"></div>
//               <div className="wall wall-left-left"></div>
//               <div className="wall wall-top"></div>
//               <div className="wall wall-top-top"></div>
//               <div className="wall wall-bottom"></div>
//               <div className="wall wall-bottom-bottom"></div>
//               <div className="wall wall-back"></div>
//             </div>
//             <div className="wrap" aria-label="Button">
//               <div className="wall wall-right"></div>
//               <div className="wall wall-right-right"></div>
//               <div className="wall wall-left"></div>
//               <div className="wall wall-top"></div>
//               <div className="wall wall-bottom"></div>
//               <div className="wall wall-back"></div>
//             </div>
//           </div>

//           <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10" aria-label="Button">
//             <span className="text-4xl md:text-4xl lg:text-5xl font-semibold max-w-7xl mx-auto text-center text-neutral-800 dark:text-white" aria-label="Button">
//              Connecting you through
//               <br />the<Cover className="mt-2">Universe</Cover>
//             </span>
//           </div>
//         </div>
//       )}

//       {phase === 'redirecting' && isLoading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black z-50" aria-label="Button">
//           <Loading />
//         </div>
//       )}
//     </div>
//   );
// };

// export async function getStaticProps({ locale }: GetServerSidePropsContext) {
//   return {
//     props: {
//       ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
//     },
//   };
// }

// export default Dashboard;

// pages/redirecting.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  // Not logged in → login
  if (!session?.user?.id) {
    return {
      redirect: { destination: '/auth/login', permanent: false },
    };
  }

  // Fast check: does user have any teams? (uses the composite index)
  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    select: { teamId: true },
    take: 1,
  });

  // Redirect immediately — no client rendering, no waiting
  return {
    redirect: {
      destination: membership ? '/dashboard' : '/onboarding',
      permanent: false,
    },
  };
};

// This only renders for a split second while redirect happens
export default function Redirecting() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-sm text-neutral-500">Redirecting...</p>
      </div>
    </div>
  );
}

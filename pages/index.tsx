// import Link from 'next/link';
import { useRef, type ReactElement } from 'react';
import type { NextPageWithLayout } from 'types/index';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import { getSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { IntroDisclosureDemo } from '@/components/ui/IntroDisclosureDemo';
import { useEffect, useState } from 'react';
import { Cover } from '@/components/ui/cover';


type Phase = 'video' | 'wall' | 'redirecting';

const Home: NextPageWithLayout = () => {
  const router = useRouter();


  // useEffect(() => {
  //   const checkSession = async () => {
  //     const session = await getSession()
  //     if (session) {
  //       redirect('/redirecting')
  //     }
  //   }
  //   checkSession()
  // }, [router])


  return (
    <>
  <LandingPage/>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Redirect to login page if landing page is disabled
  if (env.hideLandingPage) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: true,
      },
    };
  }

  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;

function LandingPage() {
  const { push } = useRouter();
  const [phase, setPhase] = useState<Phase>('video');

  // Skip video if already seen this session
  // useEffect(() => {
  //   if (sessionStorage.getItem('seen-intro')) {
  //     push('/redirecting');
  //   }
  // }, [push]);

  const handleVideoEnded = () => {
    sessionStorage.setItem('seen-intro', '1');
    setPhase('wall');
  };

  // After wall animation, go to redirecting
  useEffect(() => {
    if (phase !== 'wall') return;
    const timer = setTimeout(() => {
      push('/redirecting');
    }, 4000); // Show wall for 4s then redirect
    return () => clearTimeout(timer);
  }, [phase, push]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <style jsx global>{`
        .wall {
          background: url(https://pub-08af51b0459743828032880ad678a4cf.r2.dev/manual-upload/82fe3ef47c4eace70c45aa1639de4fd8.jpg);
          background-size: cover;
          background-position: center;
        }
        .scene {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          perspective: 5px;
          perspective-origin: 50% 50%;
          overflow: hidden;
        }
        .wrap {
          position: absolute;
          top: 50%; left: 50%;
          width: 2000px; height: 2000px;
          margin-top: -1000px; margin-left: -1000px;
          transform-style: preserve-3d;
          animation: move 12s infinite linear;
          animation-fill-mode: forwards;
        }
        .wrap:nth-child(2) {
          animation: move 12s infinite linear;
          animation-delay: 6s;
        }
        .wall-3d {
          position: absolute;
          top: 0; left: 0;
          width: 2000px; height: 2000px;
          opacity: 0;
          animation: fade 12s infinite linear;
        }
        .wrap:nth-child(2) .wall-3d { animation-delay: 6s; }
        .wall-right { transform: rotateY(90deg) translateZ(1000px); }
        .wall-right-right { transform: rotateY(90deg) translateZ(1020px); }
        .wall-left { transform: rotateY(-90deg) translateZ(1000px); }
        .wall-left-left { transform: rotateY(-90deg) translateZ(1020px); }
        .wall-top { transform: rotateX(90deg) translateZ(1000px); }
        .wall-bottom { transform: rotateX(-90deg) translateZ(1000px); }
        .wall-back { transform: rotateX(180deg) translateZ(1000px); }
        .wall-top-top { transform: rotateX(90deg) translateZ(1020px); }
        .wall-bottom-bottom { transform: rotateX(-90deg) translateZ(1020px); }

        @keyframes move {
          0% { transform: translateZ(-500px) rotate(0deg); }
          100% { transform: translateZ(500px) rotate(0deg); }
        }
        @keyframes fade {
          0% { opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* VIDEO PHASE */}
      {phase === 'video' && (
        <video
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="absolute inset-0 w-full h-full object-cover"
          src="/rocket_launch.mp4"
        />
      )}

      {/* WALL PHASE */}
      {phase === 'wall' && (
        <div className="relative w-full h-full overflow-hidden">
          <div className="scene">
            <div className="wrap">
              <div className="wall wall-3d wall-right" />
              <div className="wall wall-3d wall-right-right" />
              <div className="wall wall-3d wall-left" />
              <div className="wall wall-3d wall-left-left" />
              <div className="wall wall-3d wall-top" />
              <div className="wall wall-3d wall-top-top" />
              <div className="wall wall-3d wall-bottom" />
              <div className="wall wall-3d wall-bottom-bottom" />
              <div className="wall wall-3d wall-back" />
            </div>
            <div className="wrap">
              <div className="wall wall-3d wall-right" />
              <div className="wall wall-3d wall-right-right" />
              <div className="wall wall-3d wall-left" />
              <div className="wall wall-3d wall-top" />
              <div className="wall wall-3d wall-bottom" />
              <div className="wall wall-3d wall-back" />
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10">
            <span className="text-4xl md:text-5xl font-semibold max-w-7xl mx-auto text-center text-white">
              Connecting you through
              <br />
              <Cover className="mt-2">the Universe</Cover>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
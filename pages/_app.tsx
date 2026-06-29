import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head'
import { Toaster } from 'react-hot-toast';
import type { AppPropsWithLayout } from 'types/index';
import mixpanel from 'mixpanel-browser';
import '../pages/globals.css';
import { useEffect } from 'react';
import env from '@/lib/env';
import { AccountLayout } from '@/components/layouts';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import QueryProvider from 'contexts/query-provider';
import { NuqsAdapter } from 'nuqs/adapters/next/pages';
import MusicProvider from '@/components/music/music-provider';
import { NextContext } from 'hooks/use-context';
import { SocketProvider } from '@/components/chat-components/providers/socket-provider';
import { useRouter } from "next/router";
import { useIsMobile } from "hooks/useIsMobile";
import { CallProvider } from 'contexts/CallContext';
import { NotificationProvider } from "../components/notifications/NotificationContext";
import { NotificationToastContainer } from "../components/notifications/NotificationToast";
import GlobalCallOverlay from '@/components/calls/GlobalCallOverlay';
import { ScreenShareProvider } from 'contexts/ScreenShareContext';
import { ScreenShareConsentModal } from '@/components/screenshare/ConsentModal';
import { useBroadcastLocation } from 'hooks/useUserLocation';
import 'ldrs/react/LineSpinner.css'
import 'styles/whiteboard.css'
// import ConferioAI from '@/components/ai/ConferioAI';
import { RecordingProvider } from 'contexts/RecordingContext';
import { RecordingBar } from '@/components/clips/RecordingBar';
import { UploadPopup } from '@/components/clips/UploadPopup';
import { MusicLayout } from '@/components/music/music-layout';
import { useScreenTime } from 'hooks/useScreenTime';
import { IntroDisclosureDemo } from '@/components/ui/IntroDisclosureDemo';


function LocationBroadcaster() {
  useBroadcastLocation();
  return null;
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;
  const router = useRouter();
  const isMobile = useIsMobile();
   const isMusicRoute = router.pathname.startsWith("/music");

   const content = isMusicRoute ? (
      <MusicLayout>
       <Component {...pageProps} />
     </MusicLayout>
   ) : (
     <Component {...pageProps} />
   );


  // Add mixpanel
  useEffect(() => {
    if (env.mixpanel.token) {
      mixpanel.init(env.mixpanel.token, {
        debug: true,
        ignore_dnt: true,
        track_pageview: true,
      });
    }
  }, []);

  // useScreenTime();


  // useEffect(() => {
  //   if (isMobile && window.location.pathname !== "/mobile-development") {
  //     router.replace("/mobile-development");
  //   }
  // }, [isMobile, router]);

  const getLayout =
    Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

  return (
    <>
      <SessionProvider session={session}
        refetchOnWindowFocus={false}
        refetchInterval={0}>
        <QueryProvider>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange>
              <NotificationProvider>
                <ScreenShareProvider>
                  <NextContext.Provider
                    value={{ nextData: { id: 'O94kBTtw', name: 'Chuttamalle' } }}>
                    <MusicProvider>
                      <SocketProvider>
                        <CallProvider>
                          <RecordingProvider>
                          <NotificationToastContainer />
                          <LocationBroadcaster />
                          <GlobalCallOverlay />
                        
                          {getLayout(content)}
                          <ScreenShareConsentModal />
                          <Toaster toastOptions={{ duration: 3000 }} />
                          {/* <RecordingBar /> */}
                          <UploadPopup />
                          {/* <ConferioAI/> */}
                          {/* <IntroDisclosureDemo/> */}
                        </RecordingProvider>
                        </CallProvider>
                      </SocketProvider>
                    </MusicProvider>
                  </NextContext.Provider>
                </ScreenShareProvider>
              </NotificationProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </QueryProvider>
      </SessionProvider>
    </>
  );
}



export default appWithTranslation<never>(MyApp);

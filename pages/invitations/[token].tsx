import Head from 'next/head';
import { ReactElement } from 'react';
import { NextPageWithLayout } from 'types/index';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import useInvitation from 'hooks/useInvitation';
import { AuthLayout } from '@/components/layouts';
import { Error, Loading } from '@/components/shared';
import { extractEmailDomain } from '@/lib/email/utils';
import EmailMismatch from '@/components/invitation/EmailMismatch';
import AcceptInvitation from '@/components/invitation/AcceptInvitation';
import NotAuthenticated from '@/components/invitation/NotAuthenticated';
import EmailDomainMismatch from '@/components/invitation/EmailDomainMismatch';
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars';
import { GradientCard } from "@/components/ui/invite-gradient"
import RocketIcon from '@/components/ui/rocket-icon';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

import type { ApiResponse } from 'types/base';
import { defaultHeaders } from '@/lib/common';
import { Invitation, Team } from '@prisma/client';
import { useCustomSignOut } from 'hooks/useCustomSignout';


const AcceptTeamInvitation: NextPageWithLayout = () => {
  const { status, data } = useSession();
  const { t } = useTranslation('common');
  const { isLoading, error, invitation } = useInvitation();
  const router = useRouter();
  const signOut = useCustomSignOut();


  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={error.message} />;
  }

  const authUser = data?.user;

  const emailDomain = authUser?.email
    ? extractEmailDomain(authUser.email)
    : null;

  const emailMatch = invitation.email
    ? authUser?.email === invitation.email
    : false;

  const emailDomainMatch = invitation.allowedDomains.length
    ? invitation.allowedDomains.includes(emailDomain!)
    : true;

  const acceptInvitation = async () => {
    const response = await fetch(
      `/api/teams/${invitation.team.slug}/invitations`,
      {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify({ inviteToken: invitation.token }),
      }
    );

    if (!response.ok) {
      const result = (await response.json()) as ApiResponse;
      toast.error(result.error.message);
      return;
    }

    router.push('/dashboard');
  };

  const acceptInvite = invitation.sentViaEmail ? emailMatch : emailDomainMatch;

  return (
    <div className='min-h-screen flex !justify-center items-center relative overflow-y-scroll'>
      <div className="min-h-screen h-full absolute inset-0 opacity-80 !z-50 top-0 left-0">
        <StarsBackground />
      </div>


      <div className="flex flex-col items-center h-full gap-y-6 z-50">

        {/* <ElitePlanCard
        imageUrl="https://conferiotestbkt.s3.ap-south-1.amazonaws.com/users/fab85479-140b-46c8-b222-505126ca2860/ec8bf3b7-9c38-4134-938c-5cfeac43e642-conferioimg3.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA5TGDZJ7LRSYMDH7E%2F20260404%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260404T104048Z&X-Amz-Expires=3600&X-Amz-Signature=429cc2d75f7ab7ed16af58bc241d6f6cb4f0151b47b610eae5a171b877a0ffc1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
        title={`${invitation.team.name} `}
        subtitle="You are Invited to"
        description="Experience the fusion of art and design with the Lunar Series. Minimalist, bold, and timeless."
        onAction={() => alert("Learn more clicked!")}
      /> */}

        <motion.div

          whileHover={{ scale: 1.02 }}

          transition={{ type: "spring", stiffness: 250, damping: 20 }}
          className={cn(
            "relative w-full max-w-md overflow-hidden rounded-3xl hover:shadow-xl bg-black",

          )}

        >

          {/* <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-white/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-bounce"></div>
            <div className="absolute top-10 left-10  size-16  rounded-full bg-white/5 blur-xl animate-ping"></div>
            <div className="absolute bottom-16 right-16  size-12  rounded-full bg-white/5 blur-lg animate-ping"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
          </div> */}

          <div className="absolute inset-0 z-0 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
  
  {/* Smooth floating animation instead of bounce */}
  <div 
    className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-white/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700"
    style={{ 
      animation: 'float 1s cubic-bezier(0.16, 1, 0.3, 1) infinite alternate'
    }}
  ></div>
  
  <div className="absolute top-10 left-10 size-16 rounded-full bg-white/5 blur-xl animate-ping"></div>
  <div className="absolute bottom-16 right-16 size-12 rounded-full bg-white/5 blur-lg animate-ping"></div>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
</div>

          {/* <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(180deg, #000000 0%, #000000 70%)",
          }}
          animate={{
            z: -1
          }}
        /> */}


          {/* Top image with parallax */}
          <div className="h-56 relative">
            <div className="p-3 relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse"></div>

                <div className="p-6 rounded-full  transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 hover:shadow-white/20">
                  <div className="transform group-hover:rotate-180 transition-transform duration-700">
                    <RocketIcon className="size-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              className="absolute top-0 h-full w-full overflow-hidden"
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              <img
                src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1775306167/ec8bf3b7-9c38-4134-938c-5cfeac43e642-conferioimg3_kcqxsi.jpg"
                alt=""
                className="h-full w-full object-cover object-center"
              />

              <div className="absolute bottom-0  w-full bg-gradient-to-t from-black via-black/80 to-transparent" />
            </motion.div>
          </div>
          {/* Bottom content */}
          <div className="relative z-10 p-6 bg-black text-white">
            <p className="text-sm uppercase tracking-wider text-gray-400">
              You are Invited to
            </p>

            <h3 className="mb-1 text-3xl font-semibold text-white animate-pulse transform group-hover:scale-105 transition-transform duration-300">
              {`${invitation.team.name} `}</h3>



            {status === 'unauthenticated' && (
              <>  <p className="mt-3 text-sm leading-relaxed text-gray-300">
                {t('invite-create-account')}
              </p>

                <div className="flex justify-center items-center">
                  <div className="mt-3 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>
                </div>
                <div className="mt-3 w-full flex flex-col justify-center items-center gap-2">

                  <Button
                    variant="outline"
                    className='w-full bg-[#1f1e1e]'
                    onClick={() => {
                      router.push(`/auth/join?token=${invitation.token}`);
                    }}

                  >
                    {t('create-a-new-account')}
                  </Button>
                  <Button
                    variant="outline"
                    className=" bg-white w-full text-black hover:bg-gray-200"
                    onClick={() => {
                      router.push(`/auth/login?token=${invitation.token}`);
                    }}

                  >
                    {t('login')}
                  </Button>
                </div> </>
            )}


            {status === 'authenticated' && authUser?.email &&
              invitation.sentViaEmail &&
              !emailMatch &&
              <>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  {t('email-mismatch-error', authUser)}
                </p>
                <div className="flex justify-center items-center">
                  <div className="mt-3 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>
                </div>
                <div className="mt-3">
                  <Button
                    variant="default"
                    onClick={signOut}
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                  >
                    {t('logout')}
                  </Button>
                </div>
              </>}

            {/* 
            {status === 'authenticated' &&
            !invitation.sentViaEmail &&
            invitation.allowedDomains.length > 0 &&
            !emailDomainMatch && (
              <EmailDomainMismatch
                invitation={invitation}
                emailDomain={emailDomain!}
              />
            )}   */}
            {status === 'authenticated' && (
              <>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  {t('accept-invite')}
                </p>

                <div className="flex justify-center items-center">
                  <div className="mt-3 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>
                </div>
                <div className="mt-3">
                  <Button
                    variant="default"
                    onClick={acceptInvitation}
                    className="w-full bg-white text-black hover:bg-gray-200"
                  >
                    Join the Team
                  </Button>
                </div>

              </>
            )}

          </div>
        </motion.div>



        {/* <div className="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1"  >
      <Card className="text-white rounded-2xl border border-white/10 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] shadow-2xl relative backdrop-blur-xl overflow-hidden hover:border-white/25 hover:shadow-white/5 hover:shadow-3xl w-[350px]">
        
        
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-white/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-bounce"></div>
          <div className="absolute top-10 left-10  size-16  rounded-full bg-white/5 blur-xl animate-ping"></div>
          <div className="absolute bottom-16 right-16  size-12  rounded-full bg-white/5 blur-lg animate-ping"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
        </div>

    
        <div className="p-8 relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse"></div>

            <div className="p-6 rounded-full backdrop-blur-lg border border-white/20 bg-gradient-to-br from-black/80 to-black/60 shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 hover:shadow-white/20">
              <div className="transform group-hover:rotate-180 transition-transform duration-700">
               <RocketIcon className="size-8 text-white" />
              </div>
            </div>
          </div>

          <h3 className="mb-4 text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent animate-pulse transform group-hover:scale-105 transition-transform duration-300">
           
            {`${invitation.team.name} `}
        
          </h3>

          <div className="space-y-1 max-w-sm">
            
              <p
               
                className="text-gray-300 text-sm leading-relaxed transform group-hover:text-gray-200 transition-colors duration-300"
              >
                Embark on interstellar adventures,
              </p>
           
          </div>

          <div className="mt-6 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>

          <div className="flex !gap-x-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <div className=" size-2  bg-white rounded-full animate-bounce"></div>
            <div className=" size-2  bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className=" size-2  bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>

      
        <div className="absolute top-0 left-0  size-20 bg-gradient-to-br from-white/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 right-0  size-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </Card>
    </div> */}

        {/* <h2 className="font-bold">
            {`${invitation.team.name} ${t('team-invite')}`}
          </h2> */}


      </div>
    </div>
  );
};

AcceptTeamInvitation.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default AcceptTeamInvitation;

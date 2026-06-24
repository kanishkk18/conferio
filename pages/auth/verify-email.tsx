// import { AuthLayout } from '@/components/layouts';
// import { GetServerSidePropsContext } from 'next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import type { ReactElement } from 'react';

// const VerifyEmail = () => {
//   return <>

//   </>;
// };

// VerifyEmail.getLayout = function getLayout(page: ReactElement) {
//   return (
//     <AuthLayout heading="confirm-email" description="confirm-email-description">
//       {page}
//     </AuthLayout>
//   );
// };

// export const getServerSideProps = async (
//   context: GetServerSidePropsContext
// ) => {
//   const { locale }: GetServerSidePropsContext = context;

//   return {
//     props: {
//       ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
//     },
//   };
// };

// export default VerifyEmail;


import { AuthLayout } from '@/components/layouts';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactElement } from 'react';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleResend = () => {
    setIsResending(true);
    setResendTimer(60);
    // Simulate API call
    setTimeout(() => setIsResending(false), 1000);

    // Countdown timer
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-6 py-8">
      {/* Icon Container with Gradient Background */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-[#1c2128] to-[#161b22] border border-[#30363d] rounded-2xl flex items-center justify-center shadow-2xl">
          <div className="relative">
            <Mail className=" size-10  text-purple-400" strokeWidth={1.5} />
            <div className="absolute -bottom-1 -right-1 size-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-[#161b22]">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-semibold text-[#fafafa] text-center mb-3 tracking-tight">
        Verify your email
      </h1>

      {/* Description */}
      <p className="text-[#8b949e] text-center text-sm leading-relaxed mb-8 max-w-sm">
        We&apos;ve sent a verification link to{' '}
        <span className="text-[#fafafa] font-medium">user@example.com</span>.
        Please check your inbox and click the link to activate your account.
      </p>

      {/* Email Card Preview */}
      <div className="w-full bg-[#161b22] border border-[#30363d] rounded-xl p-4 mb-6 hover:border-[#484f58] transition-colors duration-200">
        <div className="flex items-start gap-4">
          <div className=" size-10  bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="size-5 text-purple-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#fafafa] text-sm font-medium mb-1">Conferio Verification</p>
            <p className="text-[#8b949e] text-xs truncate">
              Please verify your email address to continue&hellip;
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className=" size-2  bg-green-500 rounded-full animate-pulse" />
              <span className="text-[#8b949e] text-xs">Sent just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button type="button" className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98]">
        <span className="relative flex items-center justify-center gap-2">
          Open Email Client
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
        </span>
      </button>

      {/* Divider */}
      <div className="w-full flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[#30363d]" />
        <span className="text-[#6e7681] text-xs font-medium uppercase tracking-wider">
          Didn&apos;t receive it?
        </span>
        <div className="flex-1 h-px bg-[#30363d]" />
      </div>

      {/* Resend Section */}
      <div className="flex flex-col items-center gap-3 w-full">
        <button type="button"
          onClick={handleResend}
          disabled={resendTimer > 0 || isResending}
          className="flex items-center gap-2 text-[#8b949e] hover:text-purple-400 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`size-4 ${isResending ? 'animate-spin' : ''}`} strokeWidth={2} />
          {resendTimer > 0 ? `Resend available in ${resendTimer}s` : 'Resend verification email'}
        </button>

        <p className="text-[#6e7681] text-xs text-center">
          Wrong email?{' '}
          <button type="button" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
            Change email address
          </button>
        </p>
      </div>

      {/* Security Note */}
      <div className="mt-8 flex items-center gap-2 text-[#6e7681] text-xs">
        <div className="size-1.5  bg-green-500 rounded-full" />
        <span>Secure verification • Expires in 60 minutes</span>
      </div>
    </div>
  );
};

VerifyEmail.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="confirm-email" description="confirm-email-description">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default VerifyEmail;
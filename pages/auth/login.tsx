

// import type {
//   GetServerSidePropsContext,
//   InferGetServerSidePropsType,
// } from 'next';

// import * as Yup from 'yup';
// import Link from 'next/link';
// import { useFormik } from 'formik';
// import { Button } from 'components/ui/button';
// import { useRouter } from 'next/router';
// import { useTranslation } from 'next-i18next';
// import React, { type ReactElement, useEffect, useState, useRef } from 'react';
// import type { ComponentStatus } from 'react-daisyui/dist/types';
// import { getCsrfToken, signIn, useSession } from 'next-auth/react';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// import env from '@/lib/env';
// import type { NextPageWithLayout } from 'types/';
// import { AuthLayout } from '@/components/layouts';
// import GithubButton from '@/components/auth/GithubButton';
// import GoogleButton from '@/components/auth/GoogleButton';
// import { Alert, InputWithLabel, Loading } from '@/components/shared';
// import { authProviderEnabled } from '@/lib/auth';
// import Head from 'next/head';
// import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
// import AgreeMessage from '@/components/auth/AgreeMessage';
// import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
// import ReCAPTCHA from 'react-google-recaptcha';
// import { maxLengthPolicies } from '@/lib/common';
// import { SideLine } from "public/icons/index"
// import { motion, AnimatePresence } from 'framer-motion';
// import { Input } from '@/components/ui/input';
// import GhostCursor from '@/components/ui/GhostCursor';
// import { AnimateIcon } from '@/components/animate-ui/icons/icon';
// import { RotateCcwKey } from '@/components/animate-ui/icons/rotate-ccw-key';
// import ConferioLogo from 'public/logo-transparent.png';
// import Image from 'next/image';


// interface Message {
//   text: string | null;
//   status: ComponentStatus | null;
// }

// const Login: NextPageWithLayout<
//   InferGetServerSidePropsType<typeof getServerSideProps>
// > = ({ csrfToken, authProviders, recaptchaSiteKey }) => {
//   const router = useRouter();
//   const { status } = useSession();
//   const { t } = useTranslation('common');
//   const [recaptchaToken, setRecaptchaToken] = useState<string>('');
//   const [message, setMessage] = useState<Message>({ text: null, status: null });
//   const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
//   const recaptchaRef = useRef<ReCAPTCHA>(null);
//   const [step, setStep] = useState(1);
//   const [direction, setDirection] = useState(0); // -1 for back, 1 for forward

//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const errors = await formik.validateForm();
//     if (formik.values.email && !errors.email) {
//       setDirection(1);
//       setStep(2);
//     }
//   };

//   const handleBackToEmail = () => {
//     setDirection(-1);
//     setStep(1);
//   };

//   const slideVariants = {
//     enter: (direction: number) => ({
//       x: direction > 0 ? 50 : -50,
//       opacity: 0
//     }),
//     center: {
//       x: 0,
//       opacity: 1
//     },
//     exit: (direction: number) => ({
//       x: direction > 0 ? -50 : 50,
//       opacity: 0
//     })
//   };


//   const { error, success, token } = router.query as {
//     error: string;
//     success: string;
//     token: string;
//   };

//   const handlePasswordVisibility = () => {
//     setIsPasswordVisible((prev) => !prev);
//   };

//   useEffect(() => {
//     if (error) {
//       setMessage({ text: error, status: 'error' });
//     }

//     if (success) {
//       setMessage({ text: success, status: 'success' });
//     }
//   }, [error, success]);

//   const redirectUrl = token
//     ? `/invitations/${token}`
//     : env.redirectIfAuthenticated;

//   const formik = useFormik({
//     initialValues: {
//       email: '',
//       password: '',
//     },
//     validationSchema: Yup.object().shape({
//       email: Yup.string().required().email().max(maxLengthPolicies.email),
//       password: Yup.string().required().max(maxLengthPolicies.password),
//     }),
//     validateOnChange: false,
//     validateOnBlur: true,
//     onSubmit: async (values) => {
//       const { email, password } = values;

//       setMessage({ text: null, status: null });

//       const response = await signIn('credentials', {
//         email,
//         password,
//         csrfToken,
//         redirect: false,
//         callbackUrl: redirectUrl,
//         recaptchaToken,
//       });

//       formik.resetForm();
//       recaptchaRef.current?.reset();

//       if (response && !response.ok) {
//         setMessage({ text: response.error, status: 'error' });
//         return;
//       }
//     },
//   });

//   if (status === 'loading') {
//     return <Loading />;
//   }

//   if (status === 'authenticated') {
//     router.push(redirectUrl);
//   }

//   const params = token ? `?token=${token}` : '';

//   return (
//     <>
//       <Head>
//         <title>Sign in to Conferio</title>
//         <style>{`html, body { overflow: hidden; height: 100%; }`}</style>
//       </Head>
//       <section className="relative flex w-screen h-screen max-h-screen py-12 overflow-hidden flex-col items-center justify-center">
//         <p>{message.text && message.status && (
//           <Alert status={message.status} className="mb-5">
//             {t(message.text)}
//           </Alert>
//         )} </p>

//         {/* <GhostCursor className='z-[99]'/> */}
//         <div className="relative z-10 h-[479px] w-[480px] bg-transparent pt-14 lg:w-[480px] lg:px-10 lg:pt-[20px] xs:h-[384px] xs:w-full xs:max-w-sm xs:px-5 xs:py-5">

//           <Image alt="Conferio Logo" fetchPriority="high" width={1000} height={1000} priority={true} decoding="async" data-nimg="1" className="lg:max-w-12 p-0 xs:max-w-5 text-transparent" src={ConferioLogo} />

//           <main>
//             <h1 className="mt-[17px] font-title text-3xl font-[600] leading-none tracking-snugger text-white lg:text-[32px] md:text-[28px] xs:mt-3 xs:text-[24px]">Sign in to Conferio</h1>


//             {authProviders.credentials && (
//               <form onSubmit={step === 1 ? handleEmailSubmit : formik.handleSubmit} className="overflow-hidden mt-7 flex flex-col lg:mt-6 xs:mt-5 px-1" noValidate >
//                 <div className="relative ">
//                   <AnimatePresence mode="wait" custom={direction}>
//                     {step === 1 ? (
//                       <motion.div
//                         key="step1"
//                         custom={direction}
//                         variants={slideVariants}
//                         initial="enter"
//                         animate="center"
//                         exit="exit"
//                         transition={{ duration: 0.25, ease: "easeOut" }}
//                         className=""
//                       >
//                         <label htmlFor="email" className="block text-xs leading-snug tracking-snugger text-grey-60" >Email</label>

//                         <div className="relative mt-0.5 xs:mb-2">
//                           <Input
//                             type="email"
//                             name="email"
//                             id="email"
//                             placeholder={t('name@work-email.com')}
//                             value={formik.values.email}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             autoFocus
//                             className="remove-autocomplete-styles relative block h-[42px] w-full appearance-none rounded border !bg-black px-3 py-[9px] text-[15px] tracking-snugger text-white placeholder-white/20 outline-none autofill:!text-white focus:ring-[rgba(209,208,255,0.5)] md:h-[41px] sm:text-base border-white/10" autoComplete="email" maxLength={340} required />

//                         </div>
//                         {formik.touched.email && formik.errors.email && (
//                           <span className="text-xs text-error mt-1">{formik.errors.email}</span>
//                         )}
//                       </motion.div>
//                     ) : (
//                       <motion.div
//                         key="step2"
//                         custom={direction}
//                         variants={slideVariants}
//                         initial="enter"
//                         animate="center"
//                         exit="exit"
//                         transition={{ duration: 0.25, ease: "easeOut" }}
//                         className=""
//                       >
//                         <motion.div
//                           initial={{ opacity: 0, y: -10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.1 }}
//                           className="flex items-center justify-between rounded-lg bg-base-200 py-2 px-3"
//                         >
//                           <span className="text-sm text-base-content">{formik.values.email}</span>
//                           <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             type="button"
//                             onClick={handleBackToEmail}
//                             className="text-sm text-primary hover:underline"
//                           >
//                             {t('change')}
//                           </motion.button>
//                         </motion.div>


//                         <div className="relative flex mt-2">
//                           <Input
//                             type={isPasswordVisible ? 'password' : 'password'}
//                             name="password"
//                             id="password"
//                             placeholder={t('password')}
//                             value={formik.values.password}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             className="remove-auto complete-styles relative block h-[42px] w-full appearance-none rounded border !bg-black px-3 text-[15px] tracking-snugger text-white placeholder-white/20 outline-none autofill:!text-white focus:ring-[rgba(209,208,255,0.5)] md:h-[41px] sm:text-base border-white/10" autoComplete="current-password" maxLength={340} required />

//                         </div>
//                         {formik.touched.password && formik.errors.password && (
//                           <span className="text-xs text-error mt-1">{formik.errors.password}</span>
//                         )}
//                         <div className="flex justify-between items-center px-1 mt-1">
//                           <Link
//                             href="/auth/forgot-password"
//                             className="text-sm text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
//                           >
//                             {t('forgot-password')}
//                           </Link>
//                           <TogglePasswordVisibility
//                             isPasswordVisible={isPasswordVisible}
//                             handlePasswordVisibility={handlePasswordVisibility}
//                           />
//                         </div>

//                         <motion.div
//                           initial={{ opacity: 0, scale: 0.95 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           transition={{ delay: 0.15 }}
//                           className="mt-3"
//                         >
//                           <GoogleReCAPTCHA
//                             recaptchaRef={recaptchaRef}
//                             onChange={setRecaptchaToken}
//                             siteKey={recaptchaSiteKey}
//                           />
//                         </motion.div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>

//                 <motion.div
//                   layout
//                   className="w-full"
//                 >
//                   <motion.div whileTap={{ scale: 0.98 }}>
//                     <div className="mt-[16px] h-11 xs:mt-4 xs:h-10 w-full min-w-full">

//                       <div className="relative inline-flex items-center w-full">

//                         <div className="border-button-light-blur absolute left-1/2 top-1/2 h-[calc(100%+9px)] w-[calc(100%+9px)] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform" >

//                           <div className="border-button-light relative h-full w-full rounded-full">


//                           </div>

//                         </div>
//                         <div className="border-button-light-blur absolute left-1/2 top-1/2 h-[calc(100%+9px)] w-[calc(100%+9px)] -translate-x-1/2 -translate-y-1/2 scale-x-[-1] transform rounded-full will-change-transform" >
//                           <div className="border-button-light  relative h-full w-full rounded-full">

//                           </div>
//                         </div>

//                         <button 
//                           type="submit"
//                           disabled={step === 2 && !recaptchaToken}
//                           className="transition-all min-w-full duration-200 uppercase font-bold flex items-center justify-center h-11 w-full text-[13px] text-black -tracking-[0.015em] relative z-10 overflow-hidden rounded-full border border-white/60 bg-[#d1d1d1] px-16 sm:pl-[59px] sm:pr-[52px] xs:h-10 disabled:opacity-50 disabled:cursor-not-allowed">
//                           <div className="absolute -z-10 flex w-[204px] items-center justify-center translate-x-[186px]" >

//                             <div className="absolute top-1/2 h-[121px] w-[121px] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,#FFFFF5_3.5%,_#FFAA81_26.5%,#FFDA9F_37.5%,rgba(255,170,129,0.50)_49%,rgba(210,106,58,0.00)_92.5%)]">

//                             </div>

//                             <div className="absolute top-1/2 h-[103px] w-[204px] -translate-y-1/2 bg-[radial-gradient(43.3%_44.23%_at_50%_49.51%,_#FFFFF7_29%,_#FFFACD_48.5%,_#F4D2BF_60.71%,rgba(214,211,210,0.00)_100%)] blur-[5px]"></div></div>

//                           <span className="whitespace-nowrap text-[14px] uppercase leading-[42px] text-black">

//                             {step === 1 ? t('continue') : t('Login In')}
//                           </span>

//                         </button>

//                         <div className="pointer-events-none z-50 sm:hidden" aria-hidden="true">


//                           <img className="absolute right-0 top-[-69px] h-[42px] w-auto rounded will-change-transform md:top-[-68px] md:h-[41px]" src="https://huly.io/_next/static/media/208fbf2b13b6b83dadeeca849a1dd600.svg" width="193" height="42" loading="lazy" alt="" />

//                           <img className="absolute left-0 top-[-69px] h-[42px] w-auto rounded will-change-transform md:top-[-68px] md:h-[41px]" src="https://huly.io/_next/static/media/c489348abc0625195334ee5f67ac7de9.svg" width="193" height="42" loading="lazy" alt="" />

//                           <SideLine />

//                           <svg width="480" height="614" className="absolute -right-16 -top-72 will-change-transform lg:-right-10 md:-right-11" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 480 614"><rect width="479" height="613" x=".5" y=".5" stroke="url(#form-outer-light_svg__a)" rx="19.5" /><defs><radialGradient id="form-outer-light_svg__a" cx="0" cy="0" r="1" gradientTransform="matrix(0 92.5 -92.5 0 487 389.5)" gradientUnits="userSpaceOnUse"><stop offset=".012" stopColor="#8B655C" /><stop offset=".325" stopColor="#523229" /><stop offset="1" stopColor="#523229" stopOpacity="0" /></radialGradient></defs></svg>

//                           <span className="absolute bottom-[-35px] left-0 h-px w-[169px] bg-[linear-gradient(270deg,#2D2F31_0%,#2D2F31_40%,#835549_88.5%,#CA9A8C_100%)] bg-blend-normal will-change-transform lg:-bottom-[33px] md:w-[165px]" style={{ opacity: 0 }} >

//                           </span> 

//                           <span className="absolute bottom-[-35px] right-0 h-px w-[169px] bg-[linear-gradient(90deg,#2D2F31_0%,#2D2F31_40%,#835549_88.5%,#CA9A8C_100%)] bg-blend-normal will-change-transform lg:-bottom-[33px] md:w-[165px]" >

//                           </span>

//                           <img className="absolute bottom-[-111px] right-0 rounded will-change-transform lg:-bottom-[106px] md:-bottom-[106px]" src="https://huly.io/_next/static/media/3bc5be3742f9738f5cc92dd99ca8b0b0.svg" style={{ opacity: 1 }} width="184" height="42" loading="lazy" alt="" />

//                           <img className="absolute bottom-[-111px] left-0 rounded will-change-transform lg:-bottom-[106px] md:-bottom-[106px]" src="https://huly.io/_next/static/media/acc679e7dd004cb2d74880878f988fd1.svg" style={{ opacity: 1 }} width="184" height="42" loading="lazy" alt="" />

//                         </div></div>

//                     </div>

//                   </motion.div>
//                 </motion.div>


//               </form>
//             )}

//             <div className="relative mt-[25px] flex items-center lg:mt-[23px] xs:mt-4">

//               <div className="h-px w-full bg-[linear-gradient(90deg,#443D59_0%,#2D2F31_50.9%)]"></div>

//               <span className="px-3.5 text-[13px] uppercase text-grey-40">Or</span><div className="h-px w-full bg-[linear-gradient(90deg,_#2D2F31_49.1%,_#2D2F31_100%)]">
//               </div>
//             </div>

//             <div className="mt-[25px] grid grid-cols-2 gap-x-4 lg:mt-[22px] md:gap-x-2 xs:mt-4 xs:grid-cols-1 xs:gap-y-3">

//               {authProviders.google && <GoogleButton />}
//               {authProviders.github && <GithubButton />}

//             </div>
//             {(authProviders.email || authProviders.saml) && (
//               <div className="divider"></div>
//             )}



//             <div className="py-3">

//               {authProviders.saml && (
//                 <AnimateIcon animateOnHover><Link href="/auth/sso" className="md:transition-colors duration-200 uppercase font-bold flex items-center justify-center h-10 px-16 text-white tracking-snugger rounded bg-grey-5 ring-1 ring-white/10 transition-all hover:ring-white/15 mx-px gap-x-2 md:!px-2 !text-[13px]">
//                   <RotateCcwKey className='h-5 w-5' />
//                   <span className="font-medium text-sm !normal-case">&nbsp;{t('continue-with-saml-sso')}</span>
//                 </Link>
//                 </AnimateIcon>
//               )}
//             </div>
//           </main>

//           <div className="pointer-events-none" aria-hidden="true">

//             <div className="absolute left-1/2 top-1/2 -z-20 aspect-square w-[1920px] max-w-none -translate-x-1/2 -translate-y-1/2 transform lg:w-[1880px] md:w-[1620px] sm:w-[1280px]">

//               <video src='https://huly.io/videos/pages/auth/bg.mp4' className="absolute inset-0 w-full h-full " width="1920" height="1920" autoPlay loop playsInline muted />

//             </div>

//             <img alt="" loading="lazy" width="1403" height="1000" decoding="async" data-nimg="1" className="absolute left-[28%] top-1/2 -z-20 max-w-none -translate-x-1/2 -translate-y-1/2 transform bg-blend-lighten blur-[4px] xs:left-20 xs:scale-90 text-transparent" src="https://huly.io/_next/static/media/2ee582ff1de332ce1b830df95b3f8bde.svg" />

//             <div className="absolute inset-0 -z-10 overflow-hidden rounded-[20px] shadow-[0px_4px_25px_rgba(11,13,16,0.8)] [transform:translateZ(0)] xs:rounded-[18px]" />

//             <img alt="" fetchPriority="high" width="480" height="479" decoding="async" data-nimg="1" className="absolute text-transparent inset-[1px] -z-10 max-w-none rounded-[20px] bg-black xs:left-1/2 xs:h-[384px] xs:w-auto xs:-translate-x-1/2" srcSet="https://huly.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fform-pattern.270a3962.jpg&amp;w=640&amp;q=99 1x, https://huly.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fform-pattern.270a3962.jpg&amp;w=1080&amp;q=99 2x" src="https://huly.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fform-pattern.270a3962.jpg&amp;w=1080&amp;q=99" />


//             <img alt="" fetchPriority="high" width="480" height="479" decoding="async" data-nimg="1" className="absolute left-[0.5px] text-transparent top-0 max-w-none xs:left-0 xs:w-full xs:max-w-sm" src="https://huly.io/_next/static/media/93487f9e8d46edd000f02623354df5e1.svg" />

//           </div>
//         </div>


//         <div className="relative z-10 mt-4 flex items-center gap-x-1 text-[14px] leading-snug tracking-snugger"><span className="text-white opacity-40">Don't have an account?</span>

//           <Link href="/auth/join" className="text-grey-90 hover:text-white" >Sign up</Link>

//         </div>

//         <div className="absolute bottom-8 z-10 mt-3 flex items-center gap-x-3 text-[13px] leading-snug tracking-snugger">
//           <Link href="/legal/terms" className="md:transition-colors duration-200 text-white opacity-40 transition-opacity hover:opacity-80" >Terms of Use</Link><span className="block h-3 w-px bg-grey-30">

//         </span><Link href="/legal/privacy" className="md:transition-colors duration-200 text-white opacity-40 transition-opacity hover:opacity-80" >Privacy policy</Link>

//         </div>

//       </section>
//     </>
//   );
// };

// Login.getLayout = function getLayout(page: ReactElement) {
//   return (
//     <AuthLayout heading="welcome-back" description="log-in-to-account">
//       {page}
//     </AuthLayout>
//   );
// };

// export const getServerSideProps = async (
//   context: GetServerSidePropsContext
// ) => {
//   const { locale } = context;

//   return {
//     props: {
//       ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
//       csrfToken: await getCsrfToken(context),
//       authProviders: authProviderEnabled(),
//       recaptchaSiteKey: env.recaptcha.siteKey,
//     },
//   };
// };

// export default Login;


import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';

import * as Yup from 'yup';
import Link from 'next/link';
import { useFormik } from 'formik';
import { Button } from 'components/ui/button';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { type ReactElement, useEffect, useState, useRef } from 'react';
import type { ComponentStatus } from 'react-daisyui/dist/types';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import type { NextPageWithLayout } from 'types/';
import { AuthLayout } from '@/components/layouts';
import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import { Alert, InputWithLabel, Loading } from '@/components/shared';
import { authProviderEnabled } from '@/lib/auth';
import Head from 'next/head';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { maxLengthPolicies } from '@/lib/common';
import { SideLine } from "public/icons/index"
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import GhostCursor from '@/components/ui/GhostCursor';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { RotateCcwKey } from '@/components/animate-ui/icons/rotate-ccw-key';
import ConferioLogo from 'public/logo-transparent.png';
import Image from 'next/image';


interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, authProviders, recaptchaSiteKey }) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formik.values.email && !formik.errors.email) {
      setDirection(1);
      setStep(2);
    }
  };

  const handleBackToEmail = () => {
    setDirection(-1);
    setStep(1);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0
    })
  };


  const { error, success, token } = router.query as {
    error: string;
    success: string;
    token: string;
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }

    if (success) {
      setMessage({ text: success, status: 'success' });
    }
  }, [error, success]);

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email().max(maxLengthPolicies.email),
      password: Yup.string().required().max(maxLengthPolicies.password),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;

      setMessage({ text: null, status: null });

      const response = await signIn('credentials', {
        email,
        password,
        csrfToken,
        redirect: false,
        callbackUrl: redirectUrl,
        recaptchaToken,
      });

      formik.resetForm();
      recaptchaRef.current?.reset();

      if (response && !response.ok) {
        setMessage({ text: response.error, status: 'error' });
        return;
      }
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(redirectUrl);
  }

  const params = token ? `?token=${token}` : '';

  return (
    <>
      <section className="relative flex w-screen h-screen max-h-screen py-12 !overflow-x-hidden flex-col items-center justify-center ">
        <p>{message.text && message.status && (
          <Alert status={message.status} className="mb-5">
            {t(message.text)}
          </Alert>
        )} </p>

        <GhostCursor className='z-[9999]'/>
        <div className="relative z-10 h-[479px] w-[480px] bg-transparent pt-14 lg:w-[464px] lg:px-10 lg:pt-[20px] px-12 xs:h-[384px] xs:w-full xs:max-w-sm xs:px-5 xs:py-5">

          <Image alt="" fetchPriority="high" width={1000} height={1000} priority={true} decoding="async" data-nimg="1" className="lg:max-w-16 p-0 xs:max-w-5 text-transparent" src={ConferioLogo} />

          <main>
            <h1 className="mt-[17px] font-title text-3xl font-[600] leading-none tracking-snugger text-white lg:text-32 md:text-28 xs:mt-3 xs:text-24">Sign in to Conferio</h1>


            {authProviders.credentials && (
              <form onSubmit={step === 1 ? handleEmailSubmit : formik.handleSubmit} className="overflow-hidden mt-7 flex flex-col lg:mt-6 xs:mt-5" noValidate >
                <div className="relative ">
                  <AnimatePresence mode="wait" custom={direction}>
                    {step === 1 ? (
                      <motion.div
                        key="step1"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className=""
                      >
                        <label className="block text-xs leading-snug tracking-snugger text-grey-60" >Email</label>

                        <div className="relative mt-0.5 xs:mb-2">
                          <Input
                            type="email"
                            name="email"
                            placeholder={t('name@work-email.com')}
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            autoFocus
                            className="remove-autocomplete-styles relative block h-[42px] w-full appearance-none rounded border !bg-black px-3 py-[9px] text-15 tracking-snugger text-white placeholder-white/20 outline-none autofill:!text-white focus:ring-[rgba(209,208,255,0.5)] md:h-[41px] sm:text-16 border-white/10" id="email" autoComplete="email" maxLength={340} required />

                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className=""
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center justify-between rounded-lg bg-base-200  py-2"
                        >
                          <span className="text-sm text-base-content">{formik.values.email}</span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={handleBackToEmail}
                            className="text-sm text-primary hover:underline"
                          >
                            {t('change')}
                          </motion.button>
                          {/* {authProviders.email && (
            <Link
              href={`/auth/magic-link${params}`}
              className="btn btn-outline w-full"
            >
              &nbsp;{t('sign-in-with-email')}
            </Link>
          )} */}
                        </motion.div>


                        <div className="relative flex">
                          <Input
                            type={isPasswordVisible ? 'text' : 'password'}
                            name="password"
                            placeholder={t('password')}
                            value={formik.values.password}

                            onChange={formik.handleChange}

                            className="remove-autocomplete-styles relative block h-[42px] w-full appearance-none rounded border !bg-black px-3 text-15 tracking-snugger text-white placeholder-white/20 outline-none autofill:!text-white focus:ring-[rgba(209,208,255,0.5)] md:h-[41px] sm:text-16 border-white/10" id="email" autoComplete="email" maxLength={340} required />

                        </div>
                        <div className="flex justify-between items-center px-1">
                          <Link
                            href="/auth/forgot-password"
                            className="text-sm text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
                          >
                            {t('forgot-password')}
                          </Link>
                          <TogglePasswordVisibility
                            isPasswordVisible={isPasswordVisible}
                            handlePasswordVisibility={handlePasswordVisibility}
                          />
                        </div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          <GoogleReCAPTCHA
                            recaptchaRef={recaptchaRef}
                            onChange={setRecaptchaToken}
                            siteKey={recaptchaSiteKey}
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  layout
                  className="w-full"
                >
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <div className="mt-[16px] h-11 xs:mt-4 xs:h-10 w-full min-w-full">

                      <div className="relative inline-flex items-center w-full">

                        <div className="border-button-light-blur absolute left-1/2 top-1/2 h-[calc(100%+9px)] w-[calc(100%+9px)] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform" >

                          <div className="border-button-light relative h-full w-full rounded-full">


                          </div>

                        </div>
                        <div className="border-button-light-blur absolute left-1/2 top-1/2 h-[calc(100%+9px)] w-[calc(100%+9px)] -translate-x-1/2 -translate-y-1/2 scale-x-[-1] transform rounded-full will-change-transform" >
                          <div className="border-button-light  relative h-full w-full rounded-full">

                          </div>
                        </div>

                        <button
                          active={step === 1 ? formik.values.email : formik.dirty}
                          fullWidth
                          className="transition-all min-w-full duration-200 uppercase font-bold flex items-center justify-center h-11 w-full text-13 text-black -tracking-[0.015em] relative z-10 overflow-hidden rounded-full border border-white/60 bg-[#d1d1d1] px-16 sm:pl-[59px] sm:pr-[52px] xs:h-10">
                          <div className="absolute -z-10 flex w-[204px] items-center justify-center transform-translateX(186px) translateZ(0px)" >

                            <div className="absolute top-1/2 h-[121px] w-[121px] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,#FFFFF5_3.5%,_#FFAA81_26.5%,#FFDA9F_37.5%,rgba(255,170,129,0.50)_49%,rgba(210,106,58,0.00)_92.5%)]">

                            </div>

                            <div className="absolute top-1/2 h-[103px] w-[204px] -translate-y-1/2 bg-[radial-gradient(43.3%_44.23%_at_50%_49.51%,_#FFFFF7_29%,_#FFFACD_48.5%,_#F4D2BF_60.71%,rgba(214,211,210,0.00)_100%)] blur-[5px]"></div></div>

                          <span className="whitespace-nowrap text-14 uppercase leading-[42px] text-black">

                            {step === 1 ? t('continue') : t('Login In')}
                          </span>

                        </button>

                        <div className="pointer-events-none z-50 sm:hidden" aria-hidden="true">


                          <img className="absolute right-0 top-[-69px] h-[42px] w-auto rounded will-change-transform md:top-[-68px] md:h-[41px]" src="https://huly.io/_next/static/media/208fbf2b13b6b83dadeeca849a1dd600.svg" width="193" height="42" loading="lazy" alt="" />

                          <img className="absolute left-0 top-[-69px] h-[42px] w-auto rounded will-change-transform md:top-[-68px] md:h-[41px]" src="https://huly.io/_next/static/media/c489348abc0625195334ee5f67ac7de9.svg" width="193" height="42" loading="lazy" alt="" />

                          {/* <img className="absolute -right-16 -top-72 will-change-transform lg:-right-10 md:-right-11" src={SideLine} width="480" height="614" loading="lazy" alt="" /> */}
                          <SideLine />

                          <svg width="480" height="614" className="absolute -right-16 -top-72 will-change-transform lg:-right-10 md:-right-11" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 480 614"><rect width="479" height="613" x=".5" y=".5" stroke="url(#form-outer-light_svg__a)" rx="19.5" /><defs><radialGradient id="form-outer-light_svg__a" cx="0" cy="0" r="1" gradientTransform="matrix(0 92.5 -92.5 0 487 389.5)" gradientUnits="userSpaceOnUse"><stop offset=".012" stop-color="#8B655C" /><stop offset=".325" stop-color="#523229" /><stop offset="1" stop-color="#523229" stop-opacity="0" /></radialGradient></defs></svg>

                          <span className="absolute bottom-[-35px] left-0 h-px w-[169px] bg-[linear-gradient(270deg,#2D2F31_0%,#2D2F31_40%,#835549_88.5%,#CA9A8C_100%)] bg-blend-normal will-change-transform lg:-bottom-[33px] md:w-[165px]" style={{ opacity: 0 }} >

                          </span>

                          <span className="absolute bottom-[-35px] right-0 h-px w-[169px] bg-[linear-gradient(90deg,#2D2F31_0%,#2D2F31_40%,#835549_88.5%,#CA9A8C_100%)] bg-blend-normal will-change-transform lg:-bottom-[33px] md:w-[165px]" >


                          </span>

                          <img className="absolute bottom-[-111px] right-0 rounded will-change-transform lg:-bottom-[106px] md:-bottom-[106px]" src="https://huly.io/_next/static/media/3bc5be3742f9738f5cc92dd99ca8b0b0.svg" style={{ opacity: 1 }} width="184" height="42" loading="lazy" alt="" />

                          <img className="absolute bottom-[-111px] left-0 rounded will-change-transform lg:-bottom-[106px] md:-bottom-[106px]" src="https://huly.io/_next/static/media/acc679e7dd004cb2d74880878f988fd1.svg" style={{ opacity: 1 }} width="184" height="42" loading="lazy" alt="" />

                        </div></div>

                    </div>

                  </motion.div>
                </motion.div>


              </form>
            )}

            <div className="relative mt-[25px] flex items-center lg:mt-[23px] xs:mt-4">

              <div className="h-px w-full bg-[linear-gradient(90deg,#443D59_0%,#2D2F31_50.9%)]"></div>

              <span className="px-3.5 text-13 uppercase text-grey-40">Or</span><div className="h-px w-full bg-[linear-gradient(90deg,_#2D2F31_49.1%,_#2D2F31_100%)]">
              </div>
            </div>

            <div className="mt-[25px] grid grid-cols-2 gap-x-4 lg:mt-[22px] md:gap-x-2 xs:mt-4 xs:grid-cols-1 xs:gap-y-3">

              {authProviders.google && <GoogleButton />}
              {authProviders.github && <GithubButton />}

            </div>
            {(authProviders.email || authProviders.saml) && (
              <div className="divider"></div>
            )}



            <div className="py-3">

              {authProviders.saml && (
                <AnimateIcon animateOnHover><Link href="/auth/sso" className="md:transition-colors duration-200 uppercase font-bold flex items-center justify-center h-10 px-16 text-12 text-white tracking-snugger rounded bg-grey-5 ring-1 ring-white/10 transition-all hover:ring-white/15 mx-px gap-x-2 md:!px-2 !text-13">
                  <RotateCcwKey className='h-5 w-5' />
                  <span className="font-medium text-sm !normal-case">&nbsp;{t('continue-with-saml-sso')}</span>
                </Link>
                </AnimateIcon>
              )}
            </div>
          </main>

          <div className="pointer-events-none" aria-hidden="true">

            <div className="absolute left-1/2 top-1/2 -z-20 aspect-square w-[1920px] max-w-none -translate-x-1/2 -translate-y-1/2 transform lg:w-[1880px] md:w-[1620px] sm:w-[1280px]">

              <video src='https://huly.io/videos/pages/auth/bg.mp4' className="absolute inset-0 w-full h-full " width="1920" height="1920" autoPlay loop playsInline muted />

              {/* <source src="https://huly.io/videos/pages/auth/bg.mp4?updated=20240620146606" type="video/mp4"/>
        
        <source src="https://huly.io/videos/pages/auth/bg.webm?updated=20240620146606" type="video/webm"/> */}
            </div>

            <img alt="" loading="lazy" width="1403" height="1000" decoding="async" data-nimg="1" className="absolute left-[28%] top-1/2 -z-20 max-w-none -translate-x-1/2 -translate-y-1/2 transform bg-blend-lighten blur-[4px] xs:left-20 xs:scale-90 text-transparent" src="https://huly.io/_next/static/media/2ee582ff1de332ce1b830df95b3f8bde.svg" />

            <div className="absolute inset-0 -z-10 overflow-hidden rounded-[20px] shadow-[0px_4px_25px_rgba(11,13,16,0.8)] [transform:translateZ(0)] xs:rounded-[18px]" />

            <img alt="" fetchPriority="high" width="480" height="479" decoding="async" data-nimg="1" className="absolute  text-transparent inset-[1px] -z-10 max-w-none rounded-[20px] bg-black xs:left-1/2 xs:h-[384px] xs:w-auto xs:-translate-x-1/2" srcSet="https://huly.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fform-pattern.270a3962.jpg&amp;w=640&amp;q=99 1x, https://huly.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fform-pattern.270a3962.jpg&amp;w=1080&amp;q=99 2x" src="https://huly.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fform-pattern.270a3962.jpg&amp;w=1080&amp;q=99" />


            <img alt="" fetchPriority="high" width="480" height="479" decoding="async" data-nimg="1" className="absolute left-[0.5px] text-transparent top-0 max-w-none xs:left-0 xs:w-full xs:max-w-sm" src="https://huly.io/_next/static/media/93487f9e8d46edd000f02623354df5e1.svg" />

          </div>
        </div>


        <div className="relative z-10 mt-4 flex items-center gap-x-1 text-14 leading-snug tracking-snugger"><span className="text-white opacity-40">Don't have an account?</span>

          <a className="text-grey-90 hover:text-white" href="/auth/join">Sign up</a>

        </div>

        <div className="absolute bottom-8 z-10 mt-3 flex items-center gap-x-3 text-13 leading-snug tracking-snugger"><a className="md:transition-colors duration-200 text-white opacity-40 transition-opacity hover:opacity-80" href="/legal/terms">Terms of Use</a><span className="block h-3 w-px bg-grey-30">

        </span><a className="md:transition-colors duration-200 text-white opacity-40 transition-opacity hover:opacity-80" href="/legal/privacy">Privacy policy</a>

        </div>

      </section>

      {/* <div className="rounded p-6 border">
        

        {(authProviders.github || authProviders.google) &&
          authProviders.credentials && <div className="divider">{t('or')}</div>}

        

        
      </div> */}


      {/* <div className="absolute top-1/2 h-[103px] w-[204px] -translate-y-1/2 bg-[radial-gradient(43.3%_44.23%_at_50%_49.51%,_#FFFFF7_29%,_#FFFACD_48.5%,_#F4D2BF_60.71%,rgba(214,211,210,0.00)_100%)] blur-[5px]"
               
              //  https://huly.io/videos/pages/auth/bg.mp4?updated=20240620146606  https://huly.io/_next/static/media/2ee582ff1de332ce1b830df95b3f8bde.svg  https://huly.io/_next/static/media/93487f9e8d46edd000f02623354df5e1.svg  https://huly.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fform-pattern.270a3962.jpg&w=1080&q=99 
               
               ></div> */}

    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="welcome-back" description="log-in-to-account">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csrfToken: await getCsrfToken(context),
      authProviders: authProviderEnabled(),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default Login;
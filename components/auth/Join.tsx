import { useState, useRef } from 'react';
import { InputWithLabel } from '@/components/shared';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types/base';
import * as Yup from 'yup';
import TogglePasswordVisibility from '../shared/TogglePasswordVisibility';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { maxLengthPolicies } from '@/lib/common';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface JoinProps {
  recaptchaSiteKey: string | null;
}

const JoinUserSchema = Yup.object().shape({
  name: Yup.string().required().max(maxLengthPolicies.name),
  email: Yup.string().required().email().max(maxLengthPolicies.email),
  password: Yup.string()
    .required()
    .min(passwordPolicies.minLength)
    .max(maxLengthPolicies.password),
  team: Yup.string().required().min(3).max(maxLengthPolicies.team),
});

const Join = ({ recaptchaSiteKey }: JoinProps) => {
const { push } = useRouter()
  const { t } = useTranslation('common');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      team: '',
    },
    validationSchema: JoinUserSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/join', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          ...values,
          recaptchaToken,
        }),
      });

      const json = (await response.json()) as ApiResponse<{
        confirmEmail: boolean;
      }>;

      recaptchaRef.current?.reset();

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();

      if (json.data.confirmEmail) {
        push('/auth/verify-email');
      } else {
        toast.success(t('successfully-joined'));
        push('/auth/login');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="gap-y-1">
        <div className="gap-y-1">
        <Label className='dark:text-white'>Full Name</Label>
        <Input
        className='w-full  dark:bg-[#111] '
          type="text"
          name="name"
          placeholder={t('your-name')}
          value={formik.values.name}
          // error={formik.touched.name ? formik.errors.name : undefined}
          onChange={formik.handleChange}
        /></div>
        <div className="gap-y-1"> 
        <Label className='dark:text-white'>Team Name</Label>
        <Input
          type="text"
          name="team"
          className='w-full  dark:bg-[#111] '
          placeholder={t('team-name')}
          value={formik.values.team}
          // error={formik.errors.team}
          onChange={formik.handleChange}
        /></div>

                <div className="gap-y-1">

        <Label className='dark:text-white'>Email</Label>
        <Input
          type="email"
          name="email"
          className='w-full  dark:bg-[#111] '
          placeholder={t('example@conferio.com')}
          value={formik.values.email}
          // error={formik.errors.email}
          onChange={formik.handleChange}
        />
        </div>
        <div className="gap-y-1"> 
                <Label className='dark:text-white'>Password</Label>

        <div className="relative flex">
          <Input
            type={isPasswordVisible ? 'text' : 'password'}
            name="password"
            className='w-full  dark:bg-[#111] '
            placeholder={t('password')}
            value={formik.values.password}
            // error={formik.errors.password}
            onChange={formik.handleChange}
          />
          </div>
          {/* <TogglePasswordVisibility
            isPasswordVisible={isPasswordVisible}
            handlePasswordVisibility={handlePasswordVisibility}
          /> */}
        </div>
        <GoogleReCAPTCHA
          recaptchaRef={recaptchaRef}
          onChange={setRecaptchaToken}
          siteKey={recaptchaSiteKey}
        />
      </div>
      <div className="mt-4">
        <Button 
        variant={'ghost'}
        className='w-full rounded-full hover:bg-white hover:text-black bg-white text-black dark:text-black md:transition-colors duration-200 uppercase flex items-center justify-center h-10 px-16 text-12 tracking-snugger  ring-1 ring-white/10 transition-all hover:ring-white/15 mx-px gap-x-2 md:!px-2 !text-13'
          type="submit"
          loading={formik.isSubmitting}
          active={formik.dirty}
         
        >
          {t('create-account')}
        </Button>
      </div>
    </form>
  );
};

export default Join;

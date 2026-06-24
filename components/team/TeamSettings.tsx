// import { defaultHeaders } from '@/lib/common';
// import { Team } from '@prisma/client';
// import { useFormik } from 'formik';
// import { useTranslation } from 'next-i18next';
// import { useRouter } from 'next/router';
// import React from 'react';
// import { Button } from '@/components/ui/button';
// import toast from 'react-hot-toast';
// import type { ApiResponse } from 'types/index';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { AccessControl } from '../shared/AccessControl';
// import { z } from 'zod';
// import { updateTeamSchema } from '@/lib/zod';
// import useTeams from 'hooks/useTeams';
// import { Label } from '../ui/label';
// import { Input } from '../ui/input';

// const TeamSettings = ({ team }: { team: Team }) => {
//   const router = useRouter();
//   const { t } = useTranslation('common');
//   const { mutateTeams } = useTeams();

//   const formik = useFormik<z.infer<typeof updateTeamSchema>>({
//     initialValues: {
//       name: team.name,
//       slug: team.slug,
//       domain: team.domain || '',
//     },
//     validateOnBlur: false,
//     enableReinitialize: true,
//     validate: (values) => {
//       try {
//         updateTeamSchema.parse(values);
//       } catch (error: any) {
//         return error.formErrors.fieldErrors;
//       }
//     },
//     onSubmit: async (values) => {
//       const response = await fetch(`/api/teams/${team.slug}`, {
//         method: 'PUT',
//         headers: defaultHeaders,
//         body: JSON.stringify(values),
//       });

//       const json = (await response.json()) as ApiResponse<Team>;

//       if (!response.ok) {
//         toast.error(json.error.message);
//         return;
//       }

//       toast.success(t('successfully-updated'));
//       mutateTeams();
//       router.push(`/teams/${json.data.slug}/settings`);
//     },
//   });

//   return (
//     <>
//       <form onSubmit={formik.handleSubmit}>
//         <Card className='bg-transparent border dark:border-neutral-800'>
//             <CardHeader>
//               <CardTitle>{t('team-settings')}</CardTitle>
//               <CardDescription>{t('team-settings-config')}</CardDescription>
//             </CardHeader>
//             <CardContent>
//             <div className="flex flex-col gap-4">
//               <Label>team-name</Label>
//               <Input
//                 name="name"
//                 value={formik.values.name}
//                 onChange={formik.handleChange}
//               />
//               {/* <InputWithLabel
//                 name="slug"
//                 label={t('team-slug')}
//                 value={formik.values.slug}
//                 onChange={formik.handleChange}
//                 error={formik.errors.slug}
//               /> */}
//               <Label>team-domain</Label>
//               <Input
//                 name="domain"
//                 value={formik.values.domain ? formik.values.domain : ''}
//                 onChange={formik.handleChange}
//                 defaultValue={formik.values.domain ? formik.values.domain : ''}
//               />
//             </div>
//             </CardContent>
//          <CardFooter className=' flex items-end justify-end'> 
//           <AccessControl resource="team" actions={['update']}>
//                 <Button
//                   type="submit"
//                  variant="outline"
//                 disabled={!formik.isValid || !formik.dirty}
//                 >
//                   Save Changes
//                 </Button>
//           </AccessControl>
//           </CardFooter>
//         </Card>
//       </form>
//     </>
//   );
// };

// export default TeamSettings;


// components/team/TeamSettings.tsx
import { defaultHeaders } from '@/lib/common';
import { Team } from '@prisma/client';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types/index';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AccessControl } from '../shared/AccessControl';
import { z } from 'zod';
import { updateTeamSchema } from '@/lib/zod';
import useTeams from 'hooks/useTeams';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const TeamSettings = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { mutateTeams } = useTeams();

  const formik = useFormik<z.infer<typeof updateTeamSchema>>({
    initialValues: {
      name: team.name,
      slug: team.slug,
      domain: team.domain || '',
    },
    validateOnBlur: false,
    enableReinitialize: true,
    validate: (values) => {
      try {
        updateTeamSchema.parse(values);
      } catch (error: any) {
        return error.formErrors.fieldErrors;
      }
    },
    onSubmit: async (values) => {
      const response = await fetch(`/api/teams/${team.slug}`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<Team>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('successfully-updated'));
      mutateTeams();
      router.push(`/teams/${json.data.slug}/settings`);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <Card className='border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]'>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('team-settings')}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">{t('team-settings-config')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">{t('team-name')}</Label>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              className="bg-gray-50 dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">{t('team-slug')}</Label>
            <Input
              name="slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
              className="bg-gray-50 dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">{t('team-domain')}</Label>
            <Input
              name="domain"
              value={formik.values.domain ? formik.values.domain : ''}
              onChange={formik.handleChange}
              placeholder="example.com"
              className="bg-gray-50 dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-700"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-4"> 
          <AccessControl resource="team" actions={['update']}>
            <Button
              type="submit"
              disabled={!formik.isValid || !formik.dirty}
            >
              Save Changes
            </Button>
          </AccessControl>
        </CardFooter>
      </Card>
    </form>
  );
};

export default TeamSettings;
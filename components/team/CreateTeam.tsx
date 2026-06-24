import { defaultHeaders, maxLengthPolicies } from '@/lib/common';
import type { Team } from '@prisma/client';
import { useFormik } from 'formik';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types/index';
import * as Yup from 'yup';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../ui/animated-modal";
import { Input } from '../ui/input';
import { Label } from '../ui/label';


interface CreateTeamProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const CreateTeam = ({ visible, setVisible }: CreateTeamProps) => {
  const { t } = useTranslation('common');
  const { mutateTeams } = useTeams();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required().max(maxLengthPolicies.team),
    }),
    onSubmit: async (values) => {
      const response = await fetch('/api/teams/', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<Team>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();
      mutateTeams();
      setVisible(false);
      toast.success(t('team-created'));
      router.push(`/teams/${json.data.slug}/settings`);
    },
  });

  const onClose = () => {
    setVisible(false);
    router.push(`/teams`);
  };

  return (
    <Modal>
      <form onSubmit={formik.handleSubmit} method="POST">
        <ModalTrigger>
          <Button
            variant="default"
            onClick={() => setVisible(!visible)}
          >
            {t('create-team')}
          </Button>
        </ModalTrigger>
        <ModalBody className=''>
           <ModalContent className=''>
          {/* <InputWithLabel
            label={t('name')}
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
            placeholder={t('team-name')}
            required
          /> */}
          <Label className="text-sm mb-2 font-medium">
            {t('team-name')}
            </Label>
          <Input
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
            placeholder={t('team-name')}
            required
          />
          </ModalContent>
          <ModalFooter className="gap-4">
          <Button type="button" variant="outline" onClick={onClose} className='bg-transparent'>
            {t('close')}
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={!formik.dirty || !formik.isValid}>
            {t('create-team')}
          </Button>
        </ModalFooter>
         </ModalBody>
         
      </form>
    </Modal>
  );
};

export default CreateTeam;

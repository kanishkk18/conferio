import * as Yup from 'yup';
import { mutate } from 'swr';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { Button} from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import type { ApiResponse } from 'types/base';
import useInvitations from 'hooks/useInvitations';
import { availableRoles } from '@/lib/permissions';
import type { Team } from '@prisma/client';
import { defaultHeaders, isValidDomain, maxLengthPolicies } from '@/lib/common';
// import { InputWithCopyButton } from '../shared';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useId, useRef} from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InviteViaLinkProps {
  team: Team;
}

const InviteViaLink = ({ team }: InviteViaLinkProps) => {
  const [showDelDialog, setShowDelDialog] = useState(false);
  const { t } = useTranslation('common');
  const { invitations } = useInvitations({
    slug: team.slug,
    sentViaEmail: false,
  });
   const id = useId()
  const [copied, setCopied] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }


  const FormValidationSchema = Yup.object().shape({
    domains: Yup.string()
      .nullable()
      .max(maxLengthPolicies.domains)
      .test(
        'domains',
        'Enter one or more valid domains, separated by commas.',
        (value) => {
          if (!value) {
            return true;
          }

          return value.split(',').every(isValidDomain);
        }
      ),
    role: Yup.string()
      .required(t('required-role'))
      .oneOf(availableRoles.map((r) => r.id)),
  });

  // Create a new invitation link
  const formik = useFormik({
    initialValues: {
      domains: '',
      role: availableRoles[0].id,
      sentViaEmail: false,
    },
    validationSchema: FormValidationSchema,
    onSubmit: async (values) => {
      const response = await fetch(`/api/teams/${team.slug}/invitations`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const result = (await response.json()) as ApiResponse;
        toast.error(result.error.message);
        return;
      }

      mutate(`/api/teams/${team.slug}/invitations?sentViaEmail=false`);
      toast.success(t('invitation-link-created'));
      formik.resetForm();
    },
  });

  // Delete an existing invitation link
  const deleteInvitationLink = async (id: string) => {
    const response = await fetch(
      `/api/teams/${team.slug}/invitations?id=${id}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const result = (await response.json()) as ApiResponse;
      toast.error(result.error.message);
      return;
    }

    mutate(`/api/teams/${team.slug}/invitations?sentViaEmail=false`);
    toast.success(t('invitation-link-deleted'));
    setShowDelDialog(false);
  };

  const invitation = invitations ? invitations[0] : null;

  if (invitation) {
    return (
      <div className="pt-4">
         <div className="*:not-first:mt-2">
          <div className=" flex justify-between items-center pb-4 w-full">
      <Label>share-invitation-link</Label>
      <Button
          variant="destructive"
            className="w-fit h-fit -pt-1 p-1 capitalize"
            onClick={() => setShowDelDialog(true)}
          >
            delete link
          </Button></div>
      <div className="relative ">
        <Input
          ref={inputRef}
          value={invitation.url}
          className="pe-9"
          type="text"
          readOnly
        />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button"
                onClick={handleCopy}
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed"
                aria-label={copied ? "Copied" : "Copy to clipboard"}
                disabled={copied}
              >
                <div
                  className={cn(
                    "transition-all",
                    copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                >
                  <CheckIcon
                    className="stroke-emerald-500"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
                <div
                  className={cn(
                    "absolute transition-all",
                    copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                  )}
                >
                  <CopyIcon size={16} aria-hidden="true" />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs">
              Copy to clipboard
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
       
        <p className="text-sm text-slate-500 my-2">
          {invitation.allowedDomains.length > 0
            ? `Anyone with an email address ending with ${invitation.allowedDomains} can use this link to join your team.`
            : 'Anyone can use this link to join your team.'}
        </p>
        <ConfirmationDialog
          visible={showDelDialog}
          onCancel={() => setShowDelDialog(false)}
          onConfirm={() => deleteInvitationLink(invitation.id)}
          title={t('delete-invitation-link')}
        >
          {t('delete-invitation-warning')}
        </ConfirmationDialog>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} method="POST" className="pt-4">
      <h3 className="font-medium text-[14px] pb-2">{t('invite-via-link')}</h3>
      <div className="flex gap-1">
        <Input
          name="domains"
          onChange={formik.handleChange}
          value={formik.values.domains}
          placeholder="Restrict domain: conferio.com"
          className="text-sm w-1/2"
        />
       <Select
  name="role"
  value={formik.values.role}
  onValueChange={(value) => formik.setFieldValue("role", value)}
>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a role" />
  </SelectTrigger>
  <SelectContent>
    {availableRoles.map((role) => (
      <SelectItem value={role.id} key={role.id}>
        {role.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
        <Button
          type="submit"
          variant="secondary"
          disabled={!formik.isValid}
        >
          {t('create-link')}
        </Button>
      </div>
      {/* <p className="text-sm text-slate-500 my-2">
        {formik.values.domains && !formik.errors.domains
          ? `Anyone with an email address ending with ${formik.values.domains} can use this link to join your team.`
          : 'Anyone can use this link to join your team.'}
      </p> */}
    </form>
  );
};

export default InviteViaLink;

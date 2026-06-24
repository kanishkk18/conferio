// pages/teams/[slug]/workload.tsx
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "lib/auth";
import { getTeam } from "models/team";
import Head from "next/head";
// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/router";
import WorkloadDashboard from "@/components/workload/WorkloadDashboard";
import Mainsidebar from "@/components/ui/mainSideBar";

interface Props {
  teamSlug: string;
  teamName: string;
}

export default function WorkloadPage({ teamSlug, teamName }: Props) {
  return (
    <div className="flex w-screen h-screen min-w-screen  min-h-screen max-h-screen">
     <Mainsidebar/>
      <Head>
        <title>Workload Management · {teamName}</title>
        <meta name="description" content="Team workload distribution and analytics" />
      </Head>
      <WorkloadDashboard teamSlug={teamSlug} teamName={teamName} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  const { slug } = context.params as { slug: string };

  try {
    const team = await getTeam({ slug });
    if (!team) return { notFound: true };

    return {
      props: {
        teamSlug: slug,
        teamName: team.name,
      },
    };
  } catch {
    return { notFound: true };
  }
};
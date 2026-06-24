import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface InviteCodePageProps {
  inviteCode: string;
}

export default function InviteCodePage({ inviteCode }: InviteCodePageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Processing Invite&hellip;</h1>
        <p>Please wait while we process your server invitation.</p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { inviteCode } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!inviteCode) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const existingServer = await prisma.server.findFirst({
    where: {
      inviteCode: inviteCode as string,
      members: {
        some: {
          userId: user.id
        }
      }
    }
  });

  if (existingServer) {
    return {
      redirect: {
        destination: `/servers/${existingServer.id}`,
        permanent: false,
      },
    };
  }

  const server = await prisma.server.update({
    where: {
      inviteCode: inviteCode as string
    },
    data: {
      members: {
        create: [{ userId: user.id }]
      }
    }
  });

  if (server) {
    return {
      redirect: {
        destination: `/servers/${server.id}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};
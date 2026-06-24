// lib/services/storage.ts
import { prisma } from '@/lib/prisma';

export async function checkTeamStorageQuota(teamId: string, newFileSize: number): Promise<{
  allowed: boolean;
  currentUsage: bigint;
  quota: bigint;
  remaining: bigint;
  message?: string;
}> {
  const teamStorage = await prisma.teamStorage.findUnique({
    where: { teamId },
  });

  const quota = teamStorage?.quota || BigInt(10 * 1024 * 1024 * 1024); // 10GB default
  const currentUsage = teamStorage?.usedStorage || BigInt(0);
  const remaining = quota - currentUsage;

  if (BigInt(newFileSize) > remaining) {
    return {
      allowed: false,
      currentUsage,
      quota,
      remaining,
      message: `Storage quota exceeded. Available: ${formatBytes(Number(remaining))}, Required: ${formatBytes(newFileSize)}`,
    };
  }

  return {
    allowed: true,
    currentUsage,
    quota,
    remaining: remaining - BigInt(newFileSize),
  };
}

export async function updateTeamStorageUsage(teamId: string): Promise<void> {
  const totalSize = await prisma.file.aggregate({
    where: { teamId },
    _sum: { size: true },
  });

  await prisma.teamStorage.upsert({
    where: { teamId },
    update: {
      usedStorage: totalSize._sum.size || BigInt(0),
    },
    create: {
      teamId,
      usedStorage: totalSize._sum.size || BigInt(0),
      quota: BigInt(10 * 1024 * 1024 * 1024), // 10GB
    },
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

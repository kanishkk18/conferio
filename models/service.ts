// models/service.ts
import { prisma } from '@/lib/prisma';

export const getAllServices = async () => {
  return await prisma.service.findMany();
};

export const getAllPrices = async () => {
  return await prisma.price.findMany();
};

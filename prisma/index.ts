import { Prisma, PrismaClient, PrismaPromise } from "@prisma/client";
export interface PrismaDelegate {
    aggregate(options: any): Promise<any>;
    count(options?: any): Promise<any>;
    create(options: any): Promise<any>;
    createMany(options: any): PrismaPromise<Prisma.BatchPayload>;
    delete(options: any): Promise<any>;
    deleteMany(options: any): PrismaPromise<Prisma.BatchPayload>;
    findFirst(options: any): Promise<any>;
    findMany(options: any): Promise<any[]>;
    findUnique(options: any): Promise<any>;
    update(options: any): Promise<any>;
    updateMany(options: any): PrismaPromise<Prisma.BatchPayload>;
    upsert(options: any): Promise<any>;
  }
export const myPrisma = new PrismaClient();
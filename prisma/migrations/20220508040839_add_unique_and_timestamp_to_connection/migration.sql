/*
  Warnings:

  - A unique constraint covering the columns `[campaignId,userId]` on the table `done_compaign_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emergencyId,userId]` on the table `done_emergency_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[campaignId,userId]` on the table `join_compaign_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[campaignId,userId]` on the table `report_compaign_user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `done_compaign_user` ADD COLUMN `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `done_emergency_user` ADD COLUMN `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `emergency` MODIFY `status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `join_compaign_user` ADD COLUMN `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `report_compaign_user` ADD COLUMN `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `user_gps` ADD COLUMN `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateIndex
CREATE UNIQUE INDEX `done_compaign_user_campaignId_userId_key` ON `done_compaign_user`(`campaignId`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `done_emergency_user_emergencyId_userId_key` ON `done_emergency_user`(`emergencyId`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `join_compaign_user_campaignId_userId_key` ON `join_compaign_user`(`campaignId`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `report_compaign_user_campaignId_userId_key` ON `report_compaign_user`(`campaignId`, `userId`);

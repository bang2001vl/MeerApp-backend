/*
  Warnings:

  - You are about to drop the column `compaignId` on the `done_compaign_user` table. All the data in the column will be lost.
  - You are about to drop the column `compaignId` on the `join_compaign_user` table. All the data in the column will be lost.
  - You are about to drop the column `compaignId` on the `report_compaign_user` table. All the data in the column will be lost.
  - You are about to drop the column `gpslati` on the `user_info` table. All the data in the column will be lost.
  - You are about to drop the column `gpslongti` on the `user_info` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userGPSId,subscriberId]` on the table `track_user_gps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignId` to the `done_compaign_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `join_compaign_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `report_compaign_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `done_compaign_user` DROP FOREIGN KEY `done_compaign_user_compaignId_fkey`;

-- DropForeignKey
ALTER TABLE `join_compaign_user` DROP FOREIGN KEY `join_compaign_user_compaignId_fkey`;

-- DropForeignKey
ALTER TABLE `report_compaign_user` DROP FOREIGN KEY `report_compaign_user_compaignId_fkey`;

-- AlterTable
ALTER TABLE `done_compaign_user` DROP COLUMN `compaignId`,
    ADD COLUMN `campaignId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `join_compaign_user` DROP COLUMN `compaignId`,
    ADD COLUMN `campaignId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `report_compaign_user` DROP COLUMN `compaignId`,
    ADD COLUMN `campaignId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user_info` DROP COLUMN `gpslati`,
    DROP COLUMN `gpslongti`;

-- CreateIndex
CREATE UNIQUE INDEX `track_user_gps_userGPSId_subscriberId_key` ON `track_user_gps`(`userGPSId`, `subscriberId`);

-- AddForeignKey
ALTER TABLE `join_compaign_user` ADD CONSTRAINT `join_compaign_user_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_compaign_user` ADD CONSTRAINT `report_compaign_user_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `done_compaign_user` ADD CONSTRAINT `done_compaign_user_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

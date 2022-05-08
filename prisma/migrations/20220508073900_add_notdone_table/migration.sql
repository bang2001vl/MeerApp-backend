/*
  Warnings:

  - You are about to drop the column `comment` on the `absent_compaign_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `absent_compaign_user` DROP COLUMN `comment`,
    ADD COLUMN `reason` VARCHAR(10000) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `notdone_compaign_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `comment` VARCHAR(10000) NOT NULL DEFAULT '',
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `notdone_compaign_user_campaignId_userId_key`(`campaignId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notdone_compaign_user` ADD CONSTRAINT `notdone_compaign_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notdone_compaign_user` ADD CONSTRAINT `notdone_compaign_user_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

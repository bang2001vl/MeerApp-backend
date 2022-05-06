/*
  Warnings:

  - You are about to drop the `join_emergency_user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `join_emergency_user` DROP FOREIGN KEY `join_emergency_user_emergencyId_fkey`;

-- DropForeignKey
ALTER TABLE `join_emergency_user` DROP FOREIGN KEY `join_emergency_user_userId_fkey`;

-- DropTable
DROP TABLE `join_emergency_user`;

-- CreateTable
CREATE TABLE `done_emergency_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `emergencyId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `done_emergency_user` ADD CONSTRAINT `done_emergency_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `done_emergency_user` ADD CONSTRAINT `done_emergency_user_emergencyId_fkey` FOREIGN KEY (`emergencyId`) REFERENCES `emergency`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

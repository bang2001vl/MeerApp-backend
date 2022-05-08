-- AlterTable
ALTER TABLE `user_info` ADD COLUMN `gpsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `user_gps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `liveStatus` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `user_gps_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `track_user_gps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userGPSId` INTEGER NOT NULL,
    `subscriberId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_gps` ADD CONSTRAINT `user_gps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `track_user_gps` ADD CONSTRAINT `track_user_gps_subscriberId_fkey` FOREIGN KEY (`subscriberId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `track_user_gps` ADD CONSTRAINT `track_user_gps_userGPSId_fkey` FOREIGN KEY (`userGPSId`) REFERENCES `user_gps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

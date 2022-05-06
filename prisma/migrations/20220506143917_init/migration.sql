-- CreateTable
CREATE TABLE `account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `userRole` VARCHAR(256) NOT NULL DEFAULT 'guest',
    `username` VARCHAR(256) NOT NULL,
    `password` VARCHAR(256) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `account_userId_key`(`userId`),
    INDEX `account_username_password_idx`(`username`, `password`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `token` VARCHAR(50) NOT NULL,
    `deviceInfo` VARCHAR(5000) NOT NULL,
    `userRole` VARCHAR(256) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `token`(`token`),
    INDEX `session_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(256) NOT NULL,
    `birthday` DATE NOT NULL,
    `gender` INTEGER NOT NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(256) NULL,
    `address` VARCHAR(512) NOT NULL,
    `description` VARCHAR(5000) NOT NULL,
    `avatarImageURI` VARCHAR(256) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creatorId` INTEGER NOT NULL,
    `title` VARCHAR(1000) NOT NULL,
    `content` VARCHAR(10000) NOT NULL,
    `dateTimeStart` DATETIME(3) NOT NULL,
    `address` VARCHAR(1000) NOT NULL,
    `gpslongti` DOUBLE NOT NULL,
    `gpslati` DOUBLE NOT NULL,
    `imageURI` VARCHAR(256) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creatorId` INTEGER NOT NULL,
    `title` VARCHAR(1000) NOT NULL,
    `content` VARCHAR(10000) NOT NULL,
    `address` VARCHAR(1000) NOT NULL,
    `gpslongti` DOUBLE NOT NULL,
    `gpslati` DOUBLE NOT NULL,
    `imageURI` VARCHAR(256) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `join_compaign_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compaignId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_compaign_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compaignId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `reason` VARCHAR(10000) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `done_compaign_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compaignId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `comment` VARCHAR(10000) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `join_emergency_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `emergencyId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency` ADD CONSTRAINT `emergency_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `join_compaign_user` ADD CONSTRAINT `join_compaign_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `join_compaign_user` ADD CONSTRAINT `join_compaign_user_compaignId_fkey` FOREIGN KEY (`compaignId`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_compaign_user` ADD CONSTRAINT `report_compaign_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_compaign_user` ADD CONSTRAINT `report_compaign_user_compaignId_fkey` FOREIGN KEY (`compaignId`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `done_compaign_user` ADD CONSTRAINT `done_compaign_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `done_compaign_user` ADD CONSTRAINT `done_compaign_user_compaignId_fkey` FOREIGN KEY (`compaignId`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `join_emergency_user` ADD CONSTRAINT `join_emergency_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `join_emergency_user` ADD CONSTRAINT `join_emergency_user_emergencyId_fkey` FOREIGN KEY (`emergencyId`) REFERENCES `emergency`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

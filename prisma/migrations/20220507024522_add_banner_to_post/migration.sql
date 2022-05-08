-- AlterTable
ALTER TABLE `campaign` ADD COLUMN `bannerURI` VARCHAR(256) NULL;

-- AlterTable
ALTER TABLE `emergency` ADD COLUMN `bannerURI` VARCHAR(256) NULL;

-- AlterTable
ALTER TABLE `user_info` ALTER COLUMN `gpslati` DROP DEFAULT,
    ALTER COLUMN `gpslongti` DROP DEFAULT;

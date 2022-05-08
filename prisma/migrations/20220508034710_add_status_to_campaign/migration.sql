-- AlterTable
ALTER TABLE `campaign` ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `join_compaign_user` MODIFY `status` INTEGER NOT NULL DEFAULT 0;

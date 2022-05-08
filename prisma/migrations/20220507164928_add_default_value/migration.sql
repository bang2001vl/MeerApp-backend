-- AlterTable
ALTER TABLE `done_compaign_user` MODIFY `comment` VARCHAR(10000) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `join_compaign_user` MODIFY `status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `report_compaign_user` MODIFY `reason` VARCHAR(10000) NOT NULL DEFAULT '';

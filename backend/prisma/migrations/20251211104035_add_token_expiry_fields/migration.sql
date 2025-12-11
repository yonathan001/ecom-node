-- AlterTable
ALTER TABLE `account` ADD COLUMN `accessTokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `refreshTokenExpiresAt` DATETIME(3) NULL;

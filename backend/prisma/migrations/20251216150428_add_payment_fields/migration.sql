/*
  Warnings:

  - A unique constraint covering the columns `[payment_reference]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `payment_reference` VARCHAR(191) NULL,
    ADD COLUMN `payment_status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX `orders_payment_reference_key` ON `orders`(`payment_reference`);

-- CreateIndex
CREATE INDEX `orders_payment_reference_idx` ON `orders`(`payment_reference`);

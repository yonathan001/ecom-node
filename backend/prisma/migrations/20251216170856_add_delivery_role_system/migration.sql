-- AlterTable
ALTER TABLE `orders` ADD COLUMN `assigned_to` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'customer';

-- CreateIndex
CREATE INDEX `orders_assigned_to_idx` ON `orders`(`assigned_to`);

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

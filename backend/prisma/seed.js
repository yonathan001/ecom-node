const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = 'admin@ecommerce.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    // Better Auth uses a specific hash format: $2a$ or $2b$ prefix
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        emailVerified: true,
        is_admin: true,
      },
    });

    // Create account with password for Better Auth
    await prisma.account.create({
      data: {
        userId: admin.id,
        accountId: adminEmail,
        providerId: 'credential',
        password: hashedPassword,
      },
    });

    console.log('✅ Admin user created');
    console.log('📧 Email: admin@ecommerce.com');
    console.log('🔑 Password: admin123456');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Create categories (only if they don't exist)
  let electronics = await prisma.categories.findFirst({
    where: { name: 'Electronics' }
  });
  if (!electronics) {
    electronics = await prisma.categories.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
      },
    });
  }

  let clothing = await prisma.categories.findFirst({
    where: { name: 'Clothing' }
  });
  if (!clothing) {
    clothing = await prisma.categories.create({
      data: {
        name: 'Clothing',
        description: 'Fashion and apparel',
      },
    });
  }

  let books = await prisma.categories.findFirst({
    where: { name: 'Books' }
  });
  if (!books) {
    books = await prisma.categories.create({
      data: {
        name: 'Books',
        description: 'Books and literature',
      },
    });
  }

  let homeGarden = await prisma.categories.findFirst({
    where: { name: 'Home & Garden' }
  });
  if (!homeGarden) {
    homeGarden = await prisma.categories.create({
      data: {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
      },
    });
  }

  console.log('✅ Categories checked/created');

  // Create products (only if they don't exist)
  const productsToCreate = [
    {
      name: 'Laptop Pro',
      description: 'High-performance laptop for professionals',
      price: 1299.99,
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      category_id: electronics.id,
      stock: 10,
    },
    {
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling headphones',
      price: 299.99,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      category_id: electronics.id,
      stock: 25,
    },
    {
      name: 'Smart Watch',
      description: 'Fitness tracking smartwatch',
      price: 399.99,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      category_id: electronics.id,
      stock: 15,
    },
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt',
      price: 29.99,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      category_id: clothing.id,
      stock: 50,
    },
    {
      name: 'Denim Jeans',
      description: 'Classic blue denim jeans',
      price: 79.99,
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      category_id: clothing.id,
      stock: 30,
    },
  ];

  for (const product of productsToCreate) {
    const existing = await prisma.products.findFirst({
      where: { name: product.name }
    });
    
    if (!existing) {
      await prisma.products.create({ data: product });
    }
  }

  console.log('✅ Products checked/created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

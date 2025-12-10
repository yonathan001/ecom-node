const { betterAuth } = require('better-auth');
const { prismaAdapter } = require('better-auth/adapters/prisma');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql'
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      is_admin: {
        type: 'boolean',
        defaultValue: false,
        required: false,
      }
    }
  },
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET,
  trustedOrigins: ['http://localhost:3000'],
  baseURL: 'http://localhost:5000',
});

module.exports = auth;

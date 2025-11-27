require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || 'file:./dev.db' } } });
p.$connect()
  .then(() => console.log('prisma:ok'))
  .catch((e) => console.error('prisma:error', e))
  .finally(() => p.$disconnect());

/**
 * Create an admin user (one-time). Uses MySQL from DATABASE_URL.
 *
 * Create new admin:
 *   node scripts/create-admin.js your@email.com YourPassword
 *
 * Reset password for existing admin:
 *   node scripts/create-admin.js --reset your@email.com NewPassword
 *
 * Default (no args): admin@bookverse.local / Admin123!
 */

const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const isReset = process.argv[2] === '--reset';
const email = process.env.ADMIN_EMAIL || (isReset ? process.argv[3] : process.argv[2]) || 'admin@bookverse.local';
const password = process.env.ADMIN_PASSWORD || (isReset ? process.argv[4] : process.argv[3]) || 'Admin123!';

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
  } catch (e) {
    console.error('Cannot connect to database. Is MySQL running? Check DATABASE_URL in .env');
    process.exit(1);
  }

  const existing = await prisma.admin_users.findFirst({ where: { email } });

  if (isReset) {
    if (!existing) {
      console.error(`No admin found for ${email}. Create one first with: node scripts/create-admin.js ${email} YourPassword`);
      process.exit(1);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.admin_users.update({
      where: { id: existing.id },
      data: { password_hash: hashedPassword },
    });
    console.log('Password reset successfully.');
    console.log('  Email:', email);
    console.log('  New password:', password);
    console.log('\nLog in at: /admin/login');
    await prisma.$disconnect();
    return;
  }

  if (existing) {
    console.log(`Admin already exists for ${email}. To set a new password, run:`);
    console.log(`  node scripts/create-admin.js --reset ${email} YourNewPassword`);
    await prisma.$disconnect();
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.admin_users.create({
    data: {
      email,
      password_hash: hashedPassword,
    },
  });

  console.log('Admin created successfully.');
  console.log('  Email:', email);
  console.log('  Password:', password);
  console.log('\nLog in at: /admin/login');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const roles = [
  { name: 'Stylist' },
  { name: 'Colorist' },
  { name: 'Senior Stylist' },
];

const adminEmail = 'admin@onyxhairsalon.com';
const adminPassword = 'Admin@onyx2026';

async function seed() {
  console.log('Seeding roles...');
  for (const role of roles) {
    await sql`
      insert into roles (name)
      values (${role.name})
      on conflict (name) do nothing
    `;
    console.log(`  ✓ ${role.name}`);
  }

  console.log('\nCreating admin employee...');
  const existing = await sql`select id from employees where email = ${adminEmail}`;
  if (existing.length > 0) {
    console.log(`  ℹ Admin already exists (${adminEmail}), skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await sql`
      insert into employees (name, email, password_hash, is_admin)
      values ('Admin', ${adminEmail}, ${passwordHash}, true)
    `;
    console.log(`  ✓ Created admin: ${adminEmail}`);
    console.log(`  ✓ Temporary password: ${adminPassword}`);
    console.log(`  ⚠ Change this password after first login!`);
  }

  await sql.end();
  console.log('\nSeed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

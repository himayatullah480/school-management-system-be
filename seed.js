const mongoose = require('mongoose');
const Organization = require('./models/organization');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/orgSystem');
  console.log('✅ Connected');

  const orgs = [
    { name: 'Sunrise School', type: 'school' },
    { name: 'Green Valley School', type: 'school' },
    { name: 'FitZone Gym', type: 'gym' },
    { name: 'Iron Temple Gym', type: 'gym' },
    { name: 'City General Hospital', type: 'hospital' },
    { name: 'Al-Shifa Hospital', type: 'hospital' },
    { name: 'MedCare Clinic', type: 'clinic' },
    { name: 'Tech Corp Office', type: 'office' },
  ];

  for (const o of orgs) {
    const exists = await Organization.findOne({ name: o.name });
    if (!exists) {
      await Organization.create(o);
      console.log(`  ➕ Created: ${o.name} (${o.type})`);
    } else {
      console.log(`  ✔ Already exists: ${o.name}`);
    }
  }

  console.log('\n✅ Seed complete!');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
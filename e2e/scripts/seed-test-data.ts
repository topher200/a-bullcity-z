#!/usr/bin/env ts-node

/**
 * Script to seed test data for E2E tests
 * Usage: npx ts-node e2e/scripts/seed-test-data.ts
 */

import { seedTestLocations, cleanupTestData } from '../utils/supabase-test-utils';
import { sampleLocations } from '../helpers/test-data';

async function main() {
  console.log('Cleaning up existing test data...');
  await cleanupTestData();
  
  console.log('Seeding test locations...');
  const locations = await seedTestLocations(sampleLocations);
  
  console.log(`Successfully seeded ${locations.length} test locations:`);
  locations.forEach((loc) => {
    console.log(`  - ${loc.name} (${loc.id})`);
  });
  
  console.log('Test data seeding complete!');
}

main().catch((error) => {
  console.error('Error seeding test data:', error);
  process.exit(1);
});

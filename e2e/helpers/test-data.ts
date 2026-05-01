import type { LocationInsert } from '../../lib/types/database';

/**
 * Generate test location data
 */
export function createTestLocation(overrides?: Partial<LocationInsert>): LocationInsert {
  return {
    name: 'Test Location',
    address: '123 Test Street, Durham, NC 27701',
    latitude: 35.9940,
    longitude: -78.8986,
    description: 'A test location for E2E testing',
    ...overrides,
  };
}

/**
 * Generate multiple test locations
 */
export function createTestLocations(count: number): LocationInsert[] {
  const locations: LocationInsert[] = [];
  const baseLat = 35.9940;
  const baseLng = -78.8986;
  
  for (let i = 0; i < count; i++) {
    locations.push({
      name: `Test Location ${i + 1}`,
      address: `${100 + i} Test Street, Durham, NC 27701`,
      latitude: baseLat + (i * 0.01),
      longitude: baseLng + (i * 0.01),
      description: `Test location number ${i + 1}`,
    });
  }
  
  return locations;
}

/**
 * Sample locations for testing
 */
export const sampleLocations: LocationInsert[] = [
  {
    name: 'Durham Bulls Athletic Park',
    address: '409 Blackwell St, Durham, NC 27701',
    latitude: 35.9940,
    longitude: -78.8986,
    description: 'Home of the Durham Bulls',
  },
  {
    name: 'Duke University',
    address: 'Durham, NC 27708',
    latitude: 36.0014,
    longitude: -78.9382,
    description: 'Duke University campus',
  },
  {
    name: 'American Tobacco Campus',
    address: '318 Blackwell St, Durham, NC 27701',
    latitude: 35.9950,
    longitude: -78.9000,
    description: 'Historic tobacco campus now home to offices and restaurants',
  },
];

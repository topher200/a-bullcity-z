import { test as base, Page } from '@playwright/test';
import { setupGoogleApiMocks } from '../utils/google-api-mocks';
import { cleanupTestData, seedTestLocations } from '../utils/supabase-test-utils';
import { sampleLocations } from '../helpers/test-data';
import { ensureTestUser, setAuthCookies } from '../helpers/auth-helpers';
import type { Location } from '../../lib/types/database';

type TestFixtures = {
  authenticatedPage: Page;
  seededLocations: Location[];
};

export const test = base.extend<TestFixtures>({
  // Authenticated page with Google API mocks
  authenticatedPage: async ({ page }, use) => {
    await setupGoogleApiMocks(page);
    await ensureTestUser();
    await setAuthCookies(page);
    await use(page);
  },

  // Page with seeded test data
  seededLocations: async ({ page }, use) => {
    await setupGoogleApiMocks(page);
    
    // Seed test locations
    const locations = await seedTestLocations(sampleLocations);
    
    // Cleanup after test
    await use(locations);
    
    // Cleanup test data
    await cleanupTestData();
  },
});

export { expect } from '@playwright/test';

import { test, expect } from './fixtures/test-fixtures';
import { setupGoogleApiMocks } from './utils/google-api-mocks';
import { seedTestLocations } from './utils/supabase-test-utils';
import { sampleLocations } from './helpers/test-data';

test.describe('Map Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await setupGoogleApiMocks(page);
    // Seed test data
    await seedTestLocations(sampleLocations);
  });

  test('should display the homepage with map and sidebar', async ({ page }) => {
    await page.goto('/');

    // Check that the page title/header is visible
    await expect(page.getByRole('heading', { name: /Bull City A-Z/i })).toBeVisible();

    // Check that the map container is present
    // The map might show "Loading map..." initially, then render
    const mapContainer = page.locator('[data-testid="map"], .gm-style, [style*="height: 600px"]').first();
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Check that the sidebar is visible
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Check that locations are listed in the sidebar
    await expect(page.getByText('Locations')).toBeVisible();
  });

  test('should display locations in the sidebar', async ({ page }) => {
    await page.goto('/');

    // Wait for locations to load
    await expect(page.getByText(/locations?/i)).toBeVisible({ timeout: 5000 });

    // Check that sample locations are displayed
    for (const location of sampleLocations) {
      await expect(page.getByText(location.name, { exact: false })).toBeVisible();
    }
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/');

    // The map might show a loading state
    // Check for either loading text or the actual map
    const loadingOrMap = page.locator('text=Loading map..., text=Loading locations..., [data-testid="map"], .gm-style').first();
    await expect(loadingOrMap).toBeVisible();
  });

  test('should handle empty locations state', async ({ page }) => {
    // Don't seed locations for this test
    await page.goto('/');

    // Should show "No locations found" or similar
    await expect(page.getByText(/no locations? found/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display map with correct dimensions', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    await page.waitForTimeout(2000);

    // Check that the map container has the expected height (600px)
    const mapContainer = page.locator('[style*="height: 600px"], [style*="height:600px"]').first();
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });
});

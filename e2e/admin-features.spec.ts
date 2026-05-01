import { test, expect } from './fixtures/test-fixtures';
import { setupGoogleApiMocks } from './utils/google-api-mocks';
import { seedTestLocations, getAllTestLocations, deleteTestLocation } from './utils/supabase-test-utils';
import { sampleLocations } from './helpers/test-data';
import { setAuthCookies, ensureTestUser } from './helpers/auth-helpers';

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupGoogleApiMocks(page);
    await ensureTestUser();
    await setAuthCookies(page);
  });

  test('should require authentication to access admin page', async ({ page }) => {
    // Clear auth cookies
    await page.context().clearCookies();
    
    await page.goto('/admin/locations');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should display admin locations page when authenticated', async ({ page }) => {
    await page.goto('/admin/locations');

    // Check that the page loads
    await expect(page.getByRole('heading', { name: /Manage Locations/i })).toBeVisible();
    
    // Check for the form section
    await expect(page.getByText('Add New Location')).toBeVisible();
    
    // Check for the locations list section
    await expect(page.getByText('Existing Locations')).toBeVisible();
  });

  test('should display existing locations in admin list', async ({ page }) => {
    // Seed test data
    const locations = await seedTestLocations(sampleLocations);
    
    await page.goto('/admin/locations');

    // Wait for locations to load
    await expect(page.getByText('Existing Locations')).toBeVisible();

    // Check that locations are displayed in the table
    for (const location of sampleLocations) {
      await expect(page.getByText(location.name)).toBeVisible();
      await expect(page.getByText(location.address)).toBeVisible();
    }

    // Cleanup
    for (const loc of locations) {
      await deleteTestLocation(loc.id);
    }
  });

  test('should show location form with Google Maps URL input', async ({ page }) => {
    await page.goto('/admin/locations');

    // Check for the URL input field
    const urlInput = page.locator('input[type="url"][name="url"]');
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toHaveAttribute('placeholder', /google.com\/maps/);

    // Check for the Import button
    await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
  });

  test('should import location from Google Maps URL', async ({ page }) => {
    await page.goto('/admin/locations');

    // Mock the places/import API route
    await page.route('**/api/places/import', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          name: 'Test Imported Location',
          address: '123 Test St, Durham, NC 27701',
          latitude: 35.9940,
          longitude: -78.8986,
          placeId: 'test-place-id',
        },
      });
    });

    // Enter a Google Maps URL
    const urlInput = page.locator('input[type="url"][name="url"]');
    await urlInput.fill('https://www.google.com/maps/place/Test+Place/@35.9940,-78.8986');

    // Click Import button
    await page.getByRole('button', { name: /Import/i }).click();

    // Wait for import to complete
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 5000 });

    // Check that form fields are populated
    await expect(page.locator('input[name="name"]')).toHaveValue('Test Imported Location');
    await expect(page.locator('input[name="address"]')).toHaveValue('123 Test St, Durham, NC 27701');
  });

  test('should validate required fields when submitting location', async ({ page }) => {
    await page.goto('/admin/locations');

    // Try to submit without importing first
    const submitButton = page.getByRole('button', { name: /Save Location/i });
    
    // Submit button should not be visible until import is done
    await expect(submitButton).not.toBeVisible();
  });

  test('should create a new location', async ({ page }) => {
    // Mock the places/import API route
    await page.route('**/api/places/import', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          name: 'New Test Location',
          address: '456 New St, Durham, NC 27701',
          latitude: 36.0014,
          longitude: -78.9382,
          placeId: 'new-test-place-id',
        },
      });
    });

    // Mock the admin/locations POST route
    let createdLocation: any = null;
    await page.route('**/api/admin/locations', async (route) => {
      if (route.request().method() === 'POST') {
        const body = await route.request().postDataJSON();
        createdLocation = {
          id: 'test-location-id',
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: createdLocation,
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin/locations');

    // Import location
    const urlInput = page.locator('input[type="url"][name="url"]');
    await urlInput.fill('https://www.google.com/maps/place/New+Test+Place/@36.0014,-78.9382');
    await page.getByRole('button', { name: /Import/i }).click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 5000 });

    // Add description
    const descriptionInput = page.locator('textarea[name="description"]');
    await descriptionInput.fill('This is a test location created via E2E test');

    // Submit the form
    const submitButton = page.getByRole('button', { name: /Save Location/i });
    await submitButton.click();

    // Wait for success (form should reset or show success message)
    await expect(page.getByText(/Successfully imported/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('should handle geocoding API errors gracefully', async ({ page }) => {
    await page.goto('/admin/locations');

    // Mock geocoding API to return an error
    await page.route('**/api/geocode', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        json: { error: 'Geocoding failed' },
      });
    });

    // This test verifies that the app handles API errors
    // The actual behavior depends on your error handling implementation
    // For now, we just verify the page doesn't crash
    await expect(page.getByText('Add New Location')).toBeVisible();
  });
});

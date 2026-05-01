import { Page } from '@playwright/test';
import { createTestUser, signInTestUser } from '../utils/supabase-test-utils';

/**
 * Test user credentials
 */
export const TEST_USER = {
  email: 'test@example.com',
  password: 'test-password-123',
};

/**
 * Create a test user if it doesn't exist
 */
export async function ensureTestUser() {
  try {
    await createTestUser(TEST_USER.email, TEST_USER.password);
  } catch (error) {
    // User might already exist, which is fine
    console.log('Test user may already exist, continuing...');
  }
}

/**
 * Sign in a user via the UI
 */
export async function signInViaUI(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for navigation after login
  await page.waitForURL('**/protected**', { timeout: 5000 });
}

/**
 * Sign out via the UI
 */
export async function signOutViaUI(page: Page) {
  // Look for logout button - adjust selector based on your actual UI
  const logoutButton = page.locator('button:has-text("Sign out"), button:has-text("Logout")').first();
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL('**/auth/login**', { timeout: 5000 });
  }
}

/**
 * Set authentication cookies directly (faster than UI login)
 * Uses the Supabase session to set proper cookies
 */
export async function setAuthCookies(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  const session = await signInTestUser(email, password);
  
  if (!session.session) {
    throw new Error('Failed to create test session');
  }
  
  // Extract project ref from Supabase URL for cookie naming
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
  const projectRef = urlMatch ? urlMatch[1] : 'default';
  
  // Supabase SSR uses these cookie names
  const accessToken = session.session.access_token;
  const refreshToken = session.session.refresh_token;
  
  const cookies = [
    {
      name: `sb-${projectRef}-auth-token`,
      value: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: session.session.expires_at,
        expires_in: session.session.expires_in,
        token_type: session.session.token_type,
        user: session.user,
      }),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
    },
  ];
  
  await page.context().addCookies(cookies);
}

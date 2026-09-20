import { defineConfig, devices } from "@playwright/test";

/**
 * Read-only/local-state E2E smoke suite for the customer-facing storefront.
 * The app talks to a live remote Supabase project (see `.env.local` — there's
 * no local/mocked backend), so these tests deliberately never exercise flows
 * that would write real data: no checkout submission, no contact form
 * submission, no account signup, no review submission. Cart/wishlist here
 * stay in the guest (localStorage-only) state, which never touches the DB.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Fixed, non-default port: 3000 may already be occupied by a `next dev`
    // instance elsewhere (e.g. an IDE preview). Using `next start` (a
    // production build, no HMR/WebSocket) avoids depending on that server or
    // on WebSocket upgrades, which some sandboxes don't allow.
    //
    // Build first with `E2E_DIST_DIR=.next-e2e npm run build` if you're
    // running this alongside a live `next dev` instance on the same
    // checkout — sharing the default `.next` directory with a running dev
    // server produces corrupted/incomplete output (missing CSS chunks).
    command: "npx next start -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: process.env.E2E_DIST_DIR ? { E2E_DIST_DIR: process.env.E2E_DIST_DIR } : {},
  },
});

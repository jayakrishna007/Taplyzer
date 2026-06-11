const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = "C:/Users/Lahari/.gemini/antigravity/brain/2d95bcb3-4f80-4834-a0a3-31a17cbfb5bd";

async function run() {
  console.log("🚀 Launching Headless Chromium browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Increase default timeout to 60 seconds for slower dev builds
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000);

  // Listen to console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔴 Browser Console Error: ${msg.text()}`);
    } else {
      console.log(`💬 Browser Console: ${msg.text()}`);
    }
  });

  // Listen to uncaught exceptions
  page.on('pageerror', err => {
    console.log(`❌ Uncaught Page Exception: ${err.message}`);
  });

  try {
    // 1. Navigate to Login Page
    console.log("🌐 Navigating to login page...");
    await page.goto("http://localhost:3000/auth?mode=signin", { waitUntil: "load" });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "login_page.png") });
    console.log("📸 Saved login_page.png");

    // 2. Log in
    console.log("🔑 Entering login credentials...");
    await page.fill('input[type="email"]', 'admin@taplyzer.com');
    await page.fill('input[type="password"]', 'password');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "login_filled.png") });
    
    console.log("🖱️ Clicking Sign In...");
    await page.click('button[type="submit"]');

    // 3. Wait for redirect
    console.log("⏳ Waiting for post-login redirect...");
    await page.waitForURL(url => {
      const u = url.pathname;
      return u.includes('/profile') || u.includes('/dashboard') || u.includes('/admin');
    }, { timeout: 30000 });
    
    console.log(`✅ Redirect successful! Current URL: ${page.url()}`);
    await page.waitForTimeout(3000); // Wait for transitions
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "post_login_landing.png") });
    console.log("📸 Saved post_login_landing.png");

    // 4. Navigate to Dashboard Section
    console.log("🌐 Navigating to Dashboard page...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard.png") });
    console.log("📸 Saved dashboard.png");

    // 5. Navigate to Matches Section
    console.log("🌐 Navigating to Matches page...");
    await page.goto("http://localhost:3000/matches", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "matches_page.png") });
    console.log("📸 Saved matches_page.png");

    // Try to click "View Profile" on Matches card to test the B2B modal
    console.log("🔍 Checking for 'View Profile' buttons on matches cards...");
    const matchesButtons = page.locator('button:has-text("View Profile"), a:has-text("View Profile")');
    const matchesCount = await matchesButtons.count();
    console.log(`   Found ${matchesCount} Match cards with 'View Profile' button.`);

    if (matchesCount > 0) {
      console.log("🖱️ Clicking 'View Profile' on the first match card...");
      await matchesButtons.first().click();
      await page.waitForTimeout(3000); // Wait for modal animation
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "matches_profile_modal.png") });
      console.log("📸 Saved matches_profile_modal.png");

      // Close Dialog (Radix Close or Escape)
      console.log("⌨️ Closing modal with Escape key...");
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // 6. Navigate to Explore Section
    console.log("🌐 Navigating to Explore page...");
    await page.goto("http://localhost:3000/explore", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "explore_page.png") });
    console.log("📸 Saved explore_page.png");

    // Search and test view profile
    console.log("🔍 Checking for profile cards in Explore...");
    const exploreButtons = page.locator('button:has-text("View Profile"), a:has-text("View Profile")');
    const exploreCount = await exploreButtons.count();
    console.log(`   Found ${exploreCount} profile cards with 'View Profile' button in Explore.`);
    if (exploreCount > 0) {
      console.log("🖱️ Clicking 'View Profile' in Explore...");
      await exploreButtons.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "explore_profile_modal.png") });
      console.log("📸 Saved explore_profile_modal.png");
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // 7. Navigate to Meetings
    console.log("🌐 Navigating to Meetings page...");
    await page.goto("http://localhost:3000/meetings", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "meetings_page.png") });
    console.log("📸 Saved meetings_page.png");

    // 8. Navigate to Settings
    console.log("🌐 Navigating to Settings page...");
    await page.goto("http://localhost:3000/settings", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "settings_page.png") });
    console.log("📸 Saved settings_page.png");

    // 9. Navigate to Admin Dashboard
    console.log("👑 Navigating to Admin Dashboard...");
    await page.goto("http://localhost:3000/admin", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin_dashboard.png") });
    console.log("📸 Saved admin_dashboard.png");

    // 10. Navigate to Admin NOC
    console.log("👑 Navigating to Admin NOC monitor...");
    await page.goto("http://localhost:3000/admin/noc", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin_noc.png") });
    console.log("📸 Saved admin_noc.png");

    // 11. Navigate to Admin Verification Panel
    console.log("👑 Navigating to Admin Verification Panel...");
    await page.goto("http://localhost:3000/admin/verification", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin_verification.png") });
    console.log("📸 Saved admin_verification.png");

    // 12. Navigate to Admin AI Insights
    console.log("👑 Navigating to Admin AI Insights...");
    await page.goto("http://localhost:3000/admin/ai-insights", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin_ai_insights.png") });
    console.log("📸 Saved admin_ai_insights.png");

    console.log("🎉 Manual Sanity Check successfully completed!");
  } catch (err) {
    console.error("💥 Test runner encountered an error:", err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "error_screenshot.png") });
    console.log("📸 Saved error_screenshot.png for diagnostics");
  } finally {
    await browser.close();
  }
}

run().catch(console.error);

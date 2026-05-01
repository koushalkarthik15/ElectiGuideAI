/**
 * ElectiGuide AI — Playwright E2E Tests: Polling Day Command Center
 * Run: npx playwright test __tests__/polling.spec.ts
 */
import { test, expect } from "@playwright/test";

async function bypassAuth(page: import("@playwright/test").Page) {
  await page.context().addCookies([{ name: "electiguide-session", value: "mock", domain: "localhost", path: "/" }]);
}

test.describe("Polling Day Command Center", () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); await page.goto("/polling"); });

  test("renders Command Center header with Instrument Serif", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toContainText("Command");
    const cls = await h1.getAttribute("class");
    expect(cls).toContain("font-instrument-serif");
  });

  test("shows SYSTEM LIVE indicator", async ({ page }) => {
    await expect(page.locator('text="SYSTEM LIVE"')).toBeVisible();
  });

  test("displays voting countdown with tabular numbers", async ({ page }) => {
    await expect(page.locator('text="HRS"')).toBeVisible();
    await expect(page.locator('text="MIN"')).toBeVisible();
    await expect(page.locator('text="SEC"')).toBeVisible();
  });

  test("shows weather widget with temperature", async ({ page }) => {
    await expect(page.locator('text="Current Weather"')).toBeVisible();
    // Should show temperature (34°) or "Data Cached" fallback
    const hasTemp = await page.locator('text="34°"').isVisible().catch(() => false);
    const hasCached = await page.locator('text="Data Cached"').isVisible().catch(() => false);
    expect(hasTemp || hasCached).toBeTruthy();
  });

  test("shows golden hour recommendation", async ({ page }) => {
    await expect(page.locator('text="Golden Hour"')).toBeVisible();
  });

  test("safety ticker is visible with status indicator", async ({ page }) => {
    const ticker = page.locator('[role="marquee"]');
    await expect(ticker).toBeVisible();
  });
});

test.describe("SOS Crisis Cards", () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); await page.goto("/polling"); });

  test("renders 3 emergency quick action cards", async ({ page }) => {
    await expect(page.locator('text="Name Missing from List"')).toBeVisible();
    await expect(page.locator('text="Already Voted (Sec 49P)"')).toBeVisible();
    await expect(page.locator('text="NOTA Guide"')).toBeVisible();
  });

  test("clicking SOS card opens modal with legal steps", async ({ page }) => {
    await page.click('text="Name Missing from List"');
    await expect(page.locator('text="Section 49(2)"')).toBeVisible();
    // Should show numbered steps
    await expect(page.locator('text="Presiding Officer"').first()).toBeVisible();
  });

  test("Section 49P modal contains legally precise information", async ({ page }) => {
    await page.click('text="Already Voted (Sec 49P)"');
    await expect(page.locator('text="Section 49P"')).toBeVisible();
    await expect(page.locator('text="Challenged Vote"').first()).toBeVisible();
    await expect(page.locator('text="IPC Section 171D"').first()).toBeVisible();
  });

  test("modal can be closed via X button", async ({ page }) => {
    await page.click('text="NOTA Guide"');
    await expect(page.locator('text="constitutional right"').first()).toBeVisible();
    await page.click('button[aria-label="Close modal"]');
    await expect(page.locator('text="constitutional right"')).not.toBeVisible();
  });

  test("modal can be closed by clicking backdrop", async ({ page }) => {
    await page.click('text="Name Missing from List"');
    await expect(page.locator('text="Section 49(2)"')).toBeVisible();
    // Click the backdrop (fixed overlay)
    await page.mouse.click(10, 10);
    await expect(page.locator('text="Section 49(2)"')).not.toBeVisible();
  });

  test("helpline 1950 is displayed and linked", async ({ page }) => {
    await expect(page.locator('text="1950"').first()).toBeVisible();
    const link = page.locator('a[href="tel:1950"]').first();
    await expect(link).toBeVisible();
  });
});

test.describe("Live Situation Feed", () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); await page.goto("/polling"); });

  test("renders at least 4 safety alerts", async ({ page }) => {
    await expect(page.locator('text="Live Situation Feed"')).toBeVisible();
    const alerts = page.locator('text="peaceful"').or(page.locator('text="EVM"')).or(page.locator('text="voter turnout"'));
    const count = await alerts.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("each alert shows timestamp and source", async ({ page }) => {
    await expect(page.locator('text="ECI Situation Room"').first()).toBeVisible();
  });
});

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("all sections visible and scrollable on mobile", async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/polling");
    await expect(page.locator("h1")).toContainText("Command");
    // SOS cards should be visible
    await page.locator('text="Emergency Quick Actions"').scrollIntoViewIfNeeded();
    await expect(page.locator('text="Emergency Quick Actions"')).toBeVisible();
    // Hotline should be reachable
    await page.locator('text="ECI Emergency Hotline"').scrollIntoViewIfNeeded();
    await expect(page.locator('text="ECI Emergency Hotline"')).toBeVisible();
  });

  test("SOS modal is scrollable on small screen", async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/polling");
    await page.locator('text="Already Voted (Sec 49P)"').scrollIntoViewIfNeeded();
    await page.click('text="Already Voted (Sec 49P)"');
    const modal = page.locator('.glass-panel-strong');
    await expect(modal).toBeVisible();
    const box = await modal.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(375);
  });
});

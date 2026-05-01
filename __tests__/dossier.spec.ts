/**
 * ElectiGuide AI — Playwright E2E Tests: Candidate Dossier
 * Run: npx playwright test __tests__/dossier.spec.ts
 */
import { test, expect } from "@playwright/test";

async function bypassAuth(page: import("@playwright/test").Page) {
  await page.context().addCookies([{ name: "electiguide-session", value: "mock", domain: "localhost", path: "/" }]);
}

test.describe("Dossier Grid View", () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); await page.goto("/dossier"); });

  test("renders 5 candidate dossier cards", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Dossier");
    const cards = page.locator("h2");
    await expect(cards).toHaveCount(5);
  });

  test("card shows candidate name, party abbreviation, and assets", async ({ page }) => {
    await expect(page.locator('text="Rajendra Vikram Singh"')).toBeVisible();
    await expect(page.locator('text="BJP"').first()).toBeVisible();
    await expect(page.locator('text="₹45 Cr"').first()).toBeVisible();
  });

  test("wealth values are formatted in Crores with ₹ symbol", async ({ page }) => {
    // ₹28.5 Cr, ₹67.3 Cr, ₹8.2 Cr should be visible
    await expect(page.locator('text="₹28.5 Cr"').first()).toBeVisible();
    await expect(page.locator('text="₹67.3 Cr"').first()).toBeVisible();
    await expect(page.locator('text="₹8.2 Cr"').first()).toBeVisible();
  });

  test("5th candidate (AIMIM) is present", async ({ page }) => {
    await expect(page.locator('text="Mohammed Asif Khan"')).toBeVisible();
    await expect(page.locator('text="AIMIM"').first()).toBeVisible();
    await expect(page.locator('text="₹52.8 Cr"').first()).toBeVisible();
  });

  test("uses Instrument Serif for headings", async ({ page }) => {
    const h1 = page.locator("h1");
    const cls = await h1.getAttribute("class");
    expect(cls).toContain("font-instrument-serif");
  });

  test("uses JetBrains Mono for data values", async ({ page }) => {
    const stat = page.locator('text="₹45 Cr"').first();
    const cls = await stat.getAttribute("class");
    expect(cls).toContain("font-jetbrains-mono");
  });

  test("criminal cases shown in red when > 0", async ({ page }) => {
    // Kamal Nath Yadav has 4 criminal cases
    const redCases = page.locator(".text-alert-red").first();
    await expect(redCases).toBeVisible();
  });

  test("net worth is displayed on each card", async ({ page }) => {
    const netWorthLabels = page.locator('text="Net Worth"');
    const count = await netWorthLabels.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });
});

test.describe("Comparison Flow", () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); await page.goto("/dossier"); });

  test("selecting 2 candidates shows Compare Now button", async ({ page }) => {
    const buttons = page.locator('button[aria-label*="Select"]');
    await buttons.nth(0).click();
    await expect(page.locator('text="1/2 SELECTED"')).toBeVisible();
    await buttons.nth(1).click();
    await expect(page.locator('text="Compare Now"')).toBeVisible();
  });

  test("Compare Now shows side-by-side comparison table", async ({ page }) => {
    const buttons = page.locator('button[aria-label*="Select"]');
    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await page.click('text="Compare Now"');
    await expect(page.locator('text="Candidate"')).toBeVisible();
    await expect(page.locator('text="Wealth Ratio"')).toBeVisible();
    await expect(page.locator('text="BACK TO GRID"')).toBeVisible();
  });

  test("comparison includes Net Worth row", async ({ page }) => {
    const buttons = page.locator('button[aria-label*="Select"]');
    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await page.click('text="Compare Now"');
    await expect(page.locator('text="Net Worth"').first()).toBeVisible();
  });

  test("back button returns to grid from comparison", async ({ page }) => {
    const buttons = page.locator('button[aria-label*="Select"]');
    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await page.click('text="Compare Now"');
    await page.click('text="BACK TO GRID"');
    await expect(page.locator("h2").first()).toBeVisible();
  });
});

test.describe("Expanded Dossier", () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); await page.goto("/dossier"); });

  test("clicking a card expands into detailed dossier view", async ({ page }) => {
    await page.locator('text="Rajendra Vikram Singh"').click();
    await expect(page.locator('text="Party History"')).toBeVisible();
    await expect(page.locator('text="Affidavit Declarations"')).toBeVisible();
    await expect(page.locator('text="Asset / Liability Ratio"')).toBeVisible();
  });

  test("expanded view shows M.Tech from IIT education detail", async ({ page }) => {
    await page.locator('text="Rajendra Vikram Singh"').click();
    await expect(page.locator('text="M.Tech from IIT Bombay"')).toBeVisible();
  });

  test("expanded view shows full medical education for Dr. Ananya", async ({ page }) => {
    await page.locator('text="Dr. Ananya Srivastava"').click();
    await expect(page.locator('text="MBBS (Osmania Medical College), M.D. (Public Health), MPH (Johns Hopkins)"')).toBeVisible();
  });

  test("expanded view shows specific net worth figures", async ({ page }) => {
    await page.locator('text="Rajendra Vikram Singh"').click();
    await expect(page.locator('text="Net Worth"').first()).toBeVisible();
  });

  test("back button returns to grid", async ({ page }) => {
    await page.locator('text="Rajendra Vikram Singh"').click();
    await page.click('text="BACK TO GRID"');
    await expect(page.locator("h2")).toHaveCount(5);
  });
});

test.describe("Responsive Grid", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("cards stack vertically on mobile", async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/dossier");
    const cards = page.locator("h2");
    await expect(cards).toHaveCount(5);
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first!.y).toBeLessThan(second!.y);
  });
});

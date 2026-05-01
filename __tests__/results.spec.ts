/**
 * ElectiGuide AI — E2E Tests: Results & Post-Voting Module
 * Run: npx playwright test __tests__/results.spec.ts
 */
import { test, expect } from "@playwright/test";

async function bypassAuth(page: import("@playwright/test").Page) {
  await page.context().addCookies([{ name: "electiguide-session", value: "mock", domain: "localhost", path: "/" }]);
}

test.describe("I Have Voted Flow (Polling Page)", () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/polling");
    await page.evaluate(() => {
      const stored = localStorage.getItem("electiguide-voter-progress");
      if (stored) {
        const data = JSON.parse(stored);
        data.hasVoted = false;
        localStorage.setItem("electiguide-voter-progress", JSON.stringify(data));
      }
    });
    await page.reload();
  });

  test("shows I Have Voted button when not yet voted", async ({ page }) => {
    await expect(page.locator('[data-testid="i-voted-btn"]')).toBeVisible();
    await expect(page.locator('text="I Have Voted"')).toBeVisible();
  });

  test("shows Verified Voter badge after voting", async ({ page }) => {
    // Set hasVoted in localStorage directly
    await page.evaluate(() => {
      localStorage.setItem("electiguide-voter-progress", JSON.stringify({ voterPath: null, completedSteps: [], epicNumber: null, hasVoted: true }));
    });
    await page.reload();
    await expect(page.locator('text="Verified Voter"').first()).toBeVisible();
    await expect(page.locator('[data-testid="i-voted-btn"]')).not.toBeVisible();
  });
});

test.describe("Results Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/results");
  });

  test("renders Results Dashboard header", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toContainText("Results");
    const cls = await h1.getAttribute("class");
    expect(cls).toContain("font-instrument-serif");
  });

  test("shows turnout bar chart with hourly data", async ({ page }) => {
    await expect(page.locator('text="Voter Turnout"')).toBeVisible();
    await expect(page.locator('text="78%"').first()).toBeVisible();
  });

  test("renders 4 candidate standings", async ({ page }) => {
    await expect(page.locator('text="Candidate Standings"')).toBeVisible();
    await expect(page.locator('text="Rajendra Vikram Singh"')).toBeVisible();
    await expect(page.locator('text="Priya Mehra Joshi"')).toBeVisible();
  });

  test("leading candidate has LEADING badge", async ({ page }) => {
    await expect(page.locator('text="LEADING"').first()).toBeVisible();
  });

  test("trailing candidates have TRAILING badge", async ({ page }) => {
    const trailing = page.locator('text="TRAILING"');
    const count = await trailing.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("vote counts are formatted with Indian locale", async ({ page }) => {
    // Should contain comma-separated Indian number format
    const voteText = page.locator('text="2,45,320"');
    await expect(voteText).toBeVisible();
  });
});

test.describe("Counting Roadmap", () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); await page.goto("/results"); });

  test("shows 4 counting stages", async ({ page }) => {
    await expect(page.locator('text="Counting Roadmap"')).toBeVisible();
    await expect(page.locator('text="EVM Sealing & Transport"')).toBeVisible();
    await expect(page.locator('text="Strongroom Security"')).toBeVisible();
    await expect(page.locator('text="Counting Day"')).toBeVisible();
    await expect(page.locator('text="Official Declaration"')).toBeVisible();
  });

  test("active stage shows IN PROGRESS badge", async ({ page }) => {
    await expect(page.locator('text="IN PROGRESS"')).toBeVisible();
  });

  test("counting day shows countdown timer", async ({ page }) => {
    await expect(page.locator('text="DAYS"')).toBeVisible();
  });
});

test.describe("Voted State Persistence", () => {
  test("hasVoted persists after page refresh", async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/results");
    await page.evaluate(() => {
      localStorage.setItem("electiguide-voter-progress", JSON.stringify({ voterPath: null, completedSteps: [], epicNumber: null, hasVoted: true }));
    });
    await page.reload();
    await expect(page.locator('[data-testid="verified-badge"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-testid="verified-badge"]')).toBeVisible();
  });
});

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("all sections visible on mobile", async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/results");
    await expect(page.locator("h1")).toContainText("Results");
    await page.locator('text="Counting Roadmap"').scrollIntoViewIfNeeded();
    await expect(page.locator('text="Counting Roadmap"')).toBeVisible();
  });
});

test.describe("Dashboard Navigation (Final Audit)", () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); });

  test("all dashboard routes are accessible", async ({ page }) => {
    for (const route of ["/registration", "/dossier", "/polling", "/results"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("navigation links in header work", async ({ page }) => {
    await page.goto("/registration");
    await page.click('a[href="/dossier"]');
    await expect(page.locator("h1")).toContainText("Dossier");
    await page.click('a[href="/polling"]');
    await expect(page.locator("h1")).toContainText("Command");
    await page.click('a[href="/results"]');
    await expect(page.locator("h1")).toContainText("Results");
  });
});

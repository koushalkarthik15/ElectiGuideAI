/**
 * ElectiGuide AI — Playwright E2E Test Suite
 * Target: Registration & Audit Module
 *
 * Run: npx playwright test __tests__/registration.spec.ts
 */

import { test, expect } from "@playwright/test";

// Helper: set a mock session cookie to bypass middleware
async function bypassAuth(page: import("@playwright/test").Page) {
  await page.context().addCookies([
    {
      name: "electiguide-session",
      value: "mock-session-token",
      domain: "localhost",
      path: "/",
    },
  ]);
}

// ─── State Persistence ───────────────────────────────────────────────────────

test.describe("State Persistence (Self-Healing Audit)", () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    // Clear previous state
    await page.goto("/registration");
    await page.evaluate(() => localStorage.removeItem("electiguide-voter-progress"));
    await page.reload();
  });

  test("selecting Newbie path persists after page refresh", async ({ page }) => {
    // Select Newbie Quest
    await page.click('text="The Newbie"');
    await expect(page.locator("h1")).toContainText("Newbie");

    // Refresh page
    await page.reload();

    // Should still be on Newbie checklist (not back to selection)
    await expect(page.locator("h1")).toContainText("Newbie");
  });

  test("selecting Veteran path persists after page refresh", async ({ page }) => {
    await page.click('text="The Veteran"');
    await expect(page.locator("h1")).toContainText("Veteran");

    await page.reload();
    await expect(page.locator("h1")).toContainText("Veteran");
  });

  test("completed steps persist after page refresh", async ({ page }) => {
    // Select Newbie path
    await page.click('text="The Newbie"');
    await expect(page.locator("h1")).toContainText("Newbie");

    // Complete step 1
    const firstToggle = page.locator('button[aria-label*="Mark complete"]').first();
    await firstToggle.click();

    // Verify progress shows 1/4
    await expect(page.locator('[data-testid="progress-bar"]')).toContainText("1/4");

    // Refresh
    await page.reload();

    // Progress should still show 1/4
    await expect(page.locator('[data-testid="progress-bar"]')).toContainText("1/4");
  });

  test("reset progress clears localStorage and returns to selection", async ({
    page,
  }) => {
    await page.click('text="The Newbie"');
    await expect(page.locator("h1")).toContainText("Newbie");

    // Click reset/change path
    await page.click('text="CHANGE PATH"');

    // Should be back to selection screen
    await expect(page.locator("h1")).toContainText("Choose Your");

    // Verify localStorage is cleared
    const stored = await page.evaluate(() =>
      localStorage.getItem("electiguide-voter-progress")
    );
    expect(stored).toBeNull();
  });
});

// ─── Dual-Path Selection UI ─────────────────────────────────────────────────

test.describe("Dual-Path Selection", () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/registration");
    await page.evaluate(() => localStorage.removeItem("electiguide-voter-progress"));
    await page.reload();
  });

  test("shows two path cards on initial load", async ({ page }) => {
    await expect(page.locator('text="The Newbie"')).toBeVisible();
    await expect(page.locator('text="The Veteran"')).toBeVisible();
  });

  test("Newbie card previews 4 steps", async ({ page }) => {
    await expect(page.locator('text="Search Electoral Roll"')).toBeVisible();
    await expect(page.locator('text="Form 6 Guide"')).toBeVisible();
    await expect(page.locator('text="Document Checklist"')).toBeVisible();
    await expect(page.locator('text="BLO Tracker"')).toBeVisible();
  });

  test("Veteran card previews 4 steps", async ({ page }) => {
    await expect(page.locator('text="Status Verification"')).toBeVisible();
    await expect(page.locator('text="EPIC ID Audit"')).toBeVisible();
    await expect(page.locator('text="Address Sync Check"')).toBeVisible();
    await expect(page.locator('text="Booth Confirmation"')).toBeVisible();
  });

  test("clicking Newbie transitions to the checklist", async ({ page }) => {
    await page.click('text="The Newbie"');
    // Selection cards should be gone
    await expect(page.locator('text="Choose Your"')).not.toBeVisible();
    // Checklist should be visible
    await expect(page.locator("h1")).toContainText("Newbie");
    await expect(page.locator('[role="list"]')).toBeVisible();
  });
});

// ─── Checklist Functionality ─────────────────────────────────────────────────

test.describe("Checklist Logic", () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/registration");
    await page.evaluate(() => localStorage.removeItem("electiguide-voter-progress"));
    await page.reload();
    await page.click('text="The Newbie"');
    await expect(page.locator("h1")).toContainText("Newbie");
  });

  test("all 4 steps are rendered as list items", async ({ page }) => {
    const items = page.locator('[role="listitem"]');
    await expect(items).toHaveCount(4);
  });

  test("toggling a step marks it complete and updates progress", async ({
    page,
  }) => {
    const firstToggle = page.locator('button[aria-label*="Mark complete"]').first();
    await firstToggle.click();

    // Button should now say "Mark incomplete"
    await expect(
      page.locator('button[aria-label*="Mark incomplete"]').first()
    ).toBeVisible();

    // Progress should update
    await expect(page.locator('[data-testid="progress-bar"]')).toContainText("25%");
  });

  test("toggling again marks step incomplete", async ({ page }) => {
    const firstToggle = page.locator('button[aria-label*="Mark complete"]').first();
    await firstToggle.click();

    // Now toggle back
    const undoToggle = page.locator('button[aria-label*="Mark incomplete"]').first();
    await undoToggle.click();

    // Progress should go back to 0
    await expect(page.locator('[data-testid="progress-bar"]')).toContainText("0%");
  });

  test("completing all steps shows the VERIFIED banner", async ({ page }) => {
    // Complete all 4 steps
    const toggles = page.locator('button[aria-label*="Mark complete"]');
    const count = await toggles.count();
    for (let i = 0; i < count; i++) {
      // Re-query each time as the DOM updates after each click
      const btn = page.locator('button[aria-label*="Mark complete"]').first();
      await btn.click();
      await page.waitForTimeout(100);
    }

    await expect(page.locator('text="Mission Complete"')).toBeVisible();
    await expect(page.locator('text="VERIFIED"')).toBeVisible();
  });

  test("external links point to official Voter Service Portal", async ({
    page,
  }) => {
    const links = page.locator('a[target="_blank"]');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(4);

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toMatch(/^https:\/\/(voters|electoralsearch)\.eci\.gov\.in/);
    }
  });
});

// ─── Perforated CSS Cross-Browser ────────────────────────────────────────────

test.describe("Perforated Ballot CSS", () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/registration");
    await page.evaluate(() => localStorage.removeItem("electiguide-voter-progress"));
    await page.reload();
  });

  test("ballot-card elements have mask-image or -webkit-mask-image applied", async ({
    page,
  }) => {
    // Check the Newbie card
    const newbieCard = page.locator(".ballot-card").first();
    await expect(newbieCard).toBeVisible();

    const maskImage = await newbieCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.getPropertyValue("mask-image") ||
        style.getPropertyValue("-webkit-mask-image")
      );
    });

    // Should have a non-empty mask-image value
    expect(maskImage).toBeTruthy();
    expect(maskImage).not.toBe("none");
  });

  test("ballot-card-left elements have the mirror mask", async ({ page }) => {
    const veteranCard = page.locator(".ballot-card-left").first();
    await expect(veteranCard).toBeVisible();

    const maskImage = await veteranCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.getPropertyValue("mask-image") ||
        style.getPropertyValue("-webkit-mask-image")
      );
    });

    expect(maskImage).toBeTruthy();
    expect(maskImage).not.toBe("none");
  });
});

// ─── Animation Performance ───────────────────────────────────────────────────

test.describe("Transition Fluidity", () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/registration");
    await page.evaluate(() => localStorage.removeItem("electiguide-voter-progress"));
    await page.reload();
  });

  test("no layout shift (CLS) during path selection animations", async ({
    page,
  }) => {
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      });
    });

    expect(cls).toBeLessThan(0.1);
  });

  test("card hover transitions use transform (GPU composited)", async ({
    page,
  }) => {
    const card = page.locator(".ballot-card").first();
    const classes = await card.getAttribute("class");
    // Should contain transition-transform for GPU-composited hover
    expect(classes).toContain("transition-transform");
  });

  test("step animations use opacity + transform only", async ({ page }) => {
    await page.click('text="The Newbie"');
    await expect(page.locator('[role="list"]')).toBeVisible();

    const firstItem = page.locator('[role="listitem"]').first();
    const classes = await firstItem.getAttribute("class");
    // Should use animate-fade-in-up which is opacity + translateY
    expect(classes).toContain("animate-fade-in-up");
  });
});

// ─── Accessibility ───────────────────────────────────────────────────────────

test.describe("Registration Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto("/registration");
    await page.evaluate(() => localStorage.removeItem("electiguide-voter-progress"));
    await page.reload();
    await page.click('text="The Newbie"');
    await expect(page.locator("h1")).toContainText("Newbie");
  });

  test("checklist uses role='list' and role='listitem'", async ({ page }) => {
    const list = page.locator('[role="list"]');
    await expect(list).toBeVisible();

    const items = page.locator('[role="listitem"]');
    await expect(items).toHaveCount(4);
  });

  test("toggle buttons have descriptive aria-labels", async ({ page }) => {
    const buttons = page.locator('button[aria-label*="Mark complete"]');
    const count = await buttons.count();
    expect(count).toBe(4);

    // First button should reference "Search Electoral Roll"
    const label = await buttons.first().getAttribute("aria-label");
    expect(label).toContain("Search Electoral Roll");
  });

  test("progress bar has correct ARIA attributes", async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    await expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    await expect(progressBar).toHaveAttribute("aria-valuenow", "0");
  });

  test("focus ring visible on toggle buttons", async ({ page }) => {
    const btn = page.locator('button[aria-label*="Mark complete"]').first();
    const classes = await btn.getAttribute("class");
    expect(classes).toContain("focus:ring-2");
  });
});

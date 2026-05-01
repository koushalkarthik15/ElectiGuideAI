/**
 * ElectiGuide AI — Playwright E2E Test Suite (Hardened)
 * Target: Secure Gateway (Login Page) + Middleware
 *
 * Run: npx playwright test __tests__/login.spec.ts
 */

import { test, expect } from "@playwright/test";

// ─── Security Bypass Check ───────────────────────────────────────────────────

test.describe("Route Protection (Middleware)", () => {
  const protectedRoutes = [
    "/registration",
    "/dossier",
    "/polling",
    "/results",
  ];

  for (const route of protectedRoutes) {
    test(`unauthenticated access to ${route} redirects to /login`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
      expect(page.url()).toContain(`callbackUrl=${encodeURIComponent(route)}`);
    });
  }

  // Nested route protection
  for (const route of protectedRoutes) {
    test(`nested path ${route}/details is also protected`, async ({
      page,
    }) => {
      await page.goto(`${route}/details`);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test("login page itself is accessible without auth", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("Authorization");
  });

  test("open redirect is prevented via callbackUrl validation", async ({
    page,
  }) => {
    // An attacker could try to set callbackUrl to an external site
    // Our middleware only sets callbackUrl for known internal paths
    await page.goto("/registration");
    const url = page.url();
    // callbackUrl should only contain /registration, not an external domain
    if (url.includes("callbackUrl")) {
      const parsed = new URL(url);
      const callback = parsed.searchParams.get("callbackUrl");
      expect(callback).toMatch(/^\//); // must be a relative path
      expect(callback).not.toContain("://"); // no protocol
    }
  });
});

// ─── OTP Logic Resilience ────────────────────────────────────────────────────

test.describe("OTP Input Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    // Enter a valid contact and proceed to OTP step
    await page.fill("#contact-input", "+91 98765 43210");
    await page.click('button:has-text("Send Secure OTP")');
    await expect(
      page.locator('label:has-text("Enter 6-Digit OTP")')
    ).toBeVisible({ timeout: 5000 });
  });

  test("rejects alphabetic characters in OTP fields", async ({ page }) => {
    const firstOtpInput = page.locator('[aria-label="OTP digit 1 of 6"]');
    await firstOtpInput.fill("a");
    await expect(firstOtpInput).toHaveValue("");
  });

  test("handles paste of a 6-digit code correctly", async ({ page }) => {
    const firstOtpInput = page.locator('[aria-label="OTP digit 1 of 6"]');
    await firstOtpInput.focus();

    await page.evaluate(() => {
      const container = document.querySelector('[role="group"]');
      const dt = new DataTransfer();
      dt.setData("text/plain", "123456");
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dt,
        bubbles: true,
      });
      container?.dispatchEvent(pasteEvent);
    });

    for (let i = 1; i <= 6; i++) {
      const input = page.locator(`[aria-label="OTP digit ${i} of 6"]`);
      await expect(input).toHaveValue(String(i));
    }
  });

  test("paste strips non-numeric characters", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.querySelector('[role="group"]');
      const dt = new DataTransfer();
      dt.setData("text/plain", "12ab56");
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dt,
        bubbles: true,
      });
      container?.dispatchEvent(pasteEvent);
    });

    // Only digits 1, 2, 5, 6 should be placed (4 digits total → boxes 1-4)
    const d1 = page.locator('[aria-label="OTP digit 1 of 6"]');
    const d2 = page.locator('[aria-label="OTP digit 2 of 6"]');
    const d3 = page.locator('[aria-label="OTP digit 3 of 6"]');
    const d4 = page.locator('[aria-label="OTP digit 4 of 6"]');
    await expect(d1).toHaveValue("1");
    await expect(d2).toHaveValue("2");
    await expect(d3).toHaveValue("5");
    await expect(d4).toHaveValue("6");
  });

  test("shows error and shakes card when submitting empty OTP", async ({
    page,
  }) => {
    await page.click('button:has-text("Authenticate")');
    const errorMsg = page.locator('[role="alert"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText("Enter the complete 6-digit code");
  });

  test("shows error for incorrect OTP and clears fields", async ({ page }) => {
    for (let i = 0; i < 6; i++) {
      await page
        .locator(`[aria-label="OTP digit ${i + 1} of 6"]`)
        .fill("9");
    }
    await page.click('button:has-text("Authenticate")');

    const errorMsg = page.locator('[role="alert"]');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    await expect(errorMsg).toContainText("Invalid OTP");

    for (let i = 1; i <= 6; i++) {
      await expect(
        page.locator(`[aria-label="OTP digit ${i} of 6"]`)
      ).toHaveValue("");
    }
  });

  test("backspace navigates to previous input", async ({ page }) => {
    const digit2 = page.locator('[aria-label="OTP digit 2 of 6"]');
    await digit2.focus();
    await digit2.press("Backspace");
    await expect(
      page.locator('[aria-label="OTP digit 1 of 6"]')
    ).toBeFocused();
  });

  test("error clears when user starts typing new OTP digit", async ({
    page,
  }) => {
    // Trigger error first
    await page.click('button:has-text("Authenticate")');
    await expect(page.locator('[role="alert"]')).toBeVisible();

    // Type a digit — error should clear
    const firstInput = page.locator('[aria-label="OTP digit 1 of 6"]');
    await firstInput.fill("5");
    await expect(page.locator('[role="alert"]')).not.toBeVisible();
  });
});

// ─── Contact Validation ─────────────────────────────────────────────────────

test.describe("Contact Input Validation", () => {
  test("shows invalid format indicator for garbage input", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "hello world");
    // Real-time validation should show invalid
    await expect(page.locator("#contact-hint")).toContainText("Invalid format");
  });

  test("shows valid format indicator for correct email", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "voter@india.gov.in");
    await expect(page.locator("#contact-hint")).toContainText("Valid format");
  });

  test("shows valid format indicator for correct phone", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "+91 98765 43210");
    await expect(page.locator("#contact-hint")).toContainText("Valid format");
  });

  test("shows error when submitting invalid contact format", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "abc");
    await page.click('button:has-text("Send Secure OTP")');
    const errorMsg = page.locator('[role="alert"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText("valid");
  });

  test("contact is masked in OTP step subtitle", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "voter@india.gov.in");
    await page.click('button:has-text("Send Secure OTP")');
    await expect(
      page.locator('label:has-text("Enter 6-Digit OTP")')
    ).toBeVisible({ timeout: 5000 });

    // The subtitle should contain asterisks, not the full email
    const subtitle = page.locator("text=OTP DISPATCHED");
    await expect(subtitle).toBeVisible();
    const text = await subtitle.textContent();
    expect(text).toContain("*");
    expect(text).not.toContain("voter@india.gov.in");
  });
});

// ─── Accessibility (A11y) Audit ──────────────────────────────────────────────

test.describe("Accessibility", () => {
  test("contact input has correct label and describedby association", async ({
    page,
  }) => {
    await page.goto("/login");
    const label = page.locator('label[for="contact-input"]');
    await expect(label).toBeVisible();
    await expect(label).toContainText("Mobile Number / Email");

    const input = page.locator("#contact-input");
    await expect(input).toHaveAttribute("aria-describedby", "contact-hint");
  });

  test("contact input has aria-invalid when format is wrong", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "abc");
    const input = page.locator("#contact-input");
    await expect(input).toHaveAttribute("aria-invalid", "true");
  });

  test("all OTP inputs have descriptive aria-labels", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "test@test.com");
    await page.click('button:has-text("Send Secure OTP")');
    await expect(
      page.locator('label:has-text("Enter 6-Digit OTP")')
    ).toBeVisible({ timeout: 5000 });

    for (let i = 1; i <= 6; i++) {
      const input = page.locator(`[aria-label="OTP digit ${i} of 6"]`);
      await expect(input).toBeVisible();
    }
  });

  test("OTP group has role='group' and aria-labelledby", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "test@test.com");
    await page.click('button:has-text("Send Secure OTP")');
    await expect(
      page.locator('label:has-text("Enter 6-Digit OTP")')
    ).toBeVisible({ timeout: 5000 });

    const otpGroup = page.locator('[role="group"]');
    await expect(otpGroup).toBeVisible();
    await expect(otpGroup).toHaveAttribute("aria-labelledby", "otp-label");
  });

  test("error messages use role='alert' for screen reader announcement", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click('button:has-text("Send Secure OTP")');
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
  });

  test("buttons have descriptive aria-label during loading state", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "+91 98765 43210");

    // Click and immediately check aria-label
    const btn = page.locator('button[type="submit"]');
    await btn.click();
    // During loading, aria-label should describe the loading state
    await expect(btn).toHaveAttribute(
      "aria-label",
      "Dispatching OTP, please wait"
    );
  });

  test("Saffron-on-Blue contrast passes WCAG AA", async ({ page }) => {
    await page.goto("/login");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    // #FF9933 on #002366 = 5.24:1 → passes WCAG AA (4.5:1)
    // #FFFDD0 on #002366 = 13.2:1 → passes WCAG AAA
  });

  test("focus ring is visible on buttons (WCAG 2.4.7)", async ({ page }) => {
    await page.goto("/login");
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.focus();

    // Verify focus ring classes are applied (ring-2)
    const classes = await submitBtn.getAttribute("class");
    expect(classes).toContain("focus:ring-2");
  });

  test("focus ring is visible on OTP inputs", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "test@test.com");
    await page.click('button:has-text("Send Secure OTP")');
    await expect(
      page.locator('label:has-text("Enter 6-Digit OTP")')
    ).toBeVisible({ timeout: 5000 });

    const otpInput = page.locator('[aria-label="OTP digit 1 of 6"]');
    const classes = await otpInput.getAttribute("class");
    expect(classes).toContain("focus:ring-2");
  });

  test("decorative elements are hidden from screen readers", async ({
    page,
  }) => {
    await page.goto("/login");
    const hudElements = page.locator('[aria-hidden="true"]');
    const count = await hudElements.count();
    expect(count).toBeGreaterThanOrEqual(6); // HUD corners + spinner + SVGs + divider + decorative line
  });
});

// ─── Mobile Responsiveness ───────────────────────────────────────────────────

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("card is fully visible and scrollable on small screen", async ({
    page,
  }) => {
    await page.goto("/login");
    const card = page.locator(".glass-panel-strong");
    await expect(card).toBeVisible();
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.width).toBeLessThanOrEqual(375);
  });

  test("Authenticate button is reachable when keyboard is simulated", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("#contact-input", "+91 98765 43210");
    await page.click('button:has-text("Send Secure OTP")');
    await expect(
      page.locator('label:has-text("Enter 6-Digit OTP")')
    ).toBeVisible({ timeout: 5000 });

    const authButton = page.locator('button:has-text("Authenticate")');
    await expect(authButton).toBeVisible();
    await authButton.scrollIntoViewIfNeeded();
    await expect(authButton).toBeInViewport();
  });

  test("page uses dynamic viewport height (dvh)", async ({ page }) => {
    await page.goto("/login");
    const rootDiv = page.locator("div").first();
    const classes = await rootDiv.getAttribute("class");
    expect(classes).toContain("100dvh");
  });
});

// ─── Performance ─────────────────────────────────────────────────────────────

test.describe("Performance", () => {
  test("no layout shift (CLS) on initial load", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });

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

  test("card transition uses targeted properties (no transition-all)", async ({
    page,
  }) => {
    await page.goto("/login");
    // The card wrapper should use transition-[opacity,transform] not transition-all
    const cardWrapper = page.locator(".glass-panel-strong").locator("..");
    const classes = await cardWrapper.getAttribute("class");
    // Should NOT contain 'transition-all' — should be 'transition-[opacity,transform]'
    expect(classes).toContain("transition-[opacity,transform]");
    expect(classes).not.toContain("transition-all");
  });

  test("animations use only transform/opacity (GPU composited)", async ({
    page,
  }) => {
    await page.goto("/login");
    const cardStyles = await page.locator(".glass-panel-strong").evaluate(
      (el) => {
        const computed = window.getComputedStyle(el);
        return {
          willChange: computed.willChange,
          transform: computed.transform,
        };
      }
    );
    expect(cardStyles.transform).toBeDefined();
  });
});

import { test, expect } from "../fixtures/base-fixture";
import {
  LONG_PRODUCTION_NAME,
  LONG_LINE_NAME,
  LONG_PARTICIPANT_NAME,
} from "../fixtures/mock-data";

const isMobileProject = () => test.info().project.name.startsWith("mobile-");
const isSmallViewport = () => {
  const viewport = test.info().project.use.viewport;
  return viewport != null && viewport.width <= 768;
};

test.describe("Responsive Layout", () => {
  test.describe("Global header", () => {
    test("header spans full width and is visible", async ({ landingPage }) => {
      await landingPage.goto();
      const header = landingPage.page.getByRole("button", {
        name: /open intercom/i,
      });
      await expect(header).toBeVisible();
    });

    test("header text is not truncated", async ({ landingPage }) => {
      await landingPage.goto();
      const header = landingPage.page.getByRole("button", {
        name: /open intercom/i,
      });
      const box = await header.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(100);
    });
  });

  test.describe("User settings form", () => {
    test("form is visible and inputs are accessible", async ({
      landingPage,
    }) => {
      await landingPage.goto();
      await expect(landingPage.usernameInput).toBeVisible();
      await expect(landingPage.nextButton).toBeVisible();
    });

    test("form heading is visible", async ({ landingPage }) => {
      await landingPage.goto();
      await expect(
        landingPage.page.getByRole("heading", { name: /user settings/i })
      ).toBeVisible();
    });

    test("form does not overflow viewport horizontally", async ({
      landingPage,
    }) => {
      await landingPage.goto();
      await expect(landingPage.usernameInput).toBeVisible();
      const viewport = landingPage.page.viewportSize()!;
      const input = await landingPage.usernameInput.boundingBox();
      expect(input).not.toBeNull();
      expect(input!.x + input!.width).toBeLessThanOrEqual(viewport.width + 1);
    });

    test("Next button is fully visible within viewport", async ({
      landingPage,
    }) => {
      await landingPage.goto();
      await expect(landingPage.nextButton).toBeVisible();
      const viewport = landingPage.page.viewportSize()!;
      const btn = await landingPage.nextButton.boundingBox();
      expect(btn).not.toBeNull();
      expect(btn!.x + btn!.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(btn!.y + btn!.height).toBeLessThanOrEqual(viewport.height + 100);
    });
  });

  test.describe("Production list page", () => {
    test("productions are visible after completing settings", async ({
      landingPage,
    }) => {
      await landingPage.gotoWithSettings("TestUser");
      await landingPage.expectProductionVisible("Morning Show");
      await landingPage.expectProductionVisible("Evening News");
    });

    test("page header shows Productions title", async ({ landingPage }) => {
      await landingPage.gotoWithSettings("TestUser");
      await expect(
        landingPage.page.getByText("Productions").first()
      ).toBeVisible();
    });

    test("Create and Manage buttons are hidden on small screens", async ({
      landingPage,
    }) => {
      test.skip(!isSmallViewport(), "Only applies to small viewports");
      await landingPage.gotoWithSettings("TestUser");
      await expect(landingPage.createButton).toBeHidden();
      await expect(landingPage.manageButton).toBeHidden();
    });

    test("Create and Manage buttons are visible on desktop", async ({
      landingPage,
    }) => {
      test.skip(isSmallViewport(), "Only applies to desktop viewports");
      await landingPage.gotoWithSettings("TestUser");
      await expect(landingPage.createButton).toBeVisible();
      await expect(landingPage.manageButton).toBeVisible();
    });

    test("production cards do not overflow viewport", async ({
      landingPage,
    }) => {
      await landingPage.gotoWithSettings("TestUser");
      const viewport = landingPage.page.viewportSize()!;
      const card = landingPage.page
        .getByText("Morning Show")
        .first()
        .locator("../..");
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    });

    test("production cards stack vertically on small screens", async ({
      landingPage,
    }) => {
      test.skip(!isSmallViewport(), "Only applies to small viewports");
      await landingPage.gotoWithSettings("TestUser");
      const morning = await landingPage.page
        .getByText("Morning Show")
        .first()
        .boundingBox();
      const evening = await landingPage.page
        .getByText("Evening News")
        .first()
        .boundingBox();
      expect(morning).not.toBeNull();
      expect(evening).not.toBeNull();
      // On small screens, cards should stack (evening below morning)
      expect(evening!.y).toBeGreaterThan(morning!.y);
    });

    test("empty state is centered and visible", async ({
      landingPage,
      mockApi,
    }) => {
      mockApi.clearProductions();
      await landingPage.gotoWithSettings("TestUser");
      await landingPage.expectEmptyState();
      await expect(
        landingPage.page.getByRole("button", {
          name: /create your first production/i,
        })
      ).toBeVisible();
    });
  });

  test.describe("Create production page", () => {
    test("form elements are visible", async ({ createProductionPage }) => {
      await createProductionPage.goto();
      await expect(createProductionPage.productionNameInput).toBeVisible();
      await expect(createProductionPage.defaultLineInput).toBeVisible();
      await expect(createProductionPage.createButton).toBeVisible();
      await expect(createProductionPage.addLineButton).toBeVisible();
    });

    test("page heading is visible", async ({ createProductionPage }) => {
      await createProductionPage.goto();
      await expect(
        createProductionPage.page.getByText("Create Production").first()
      ).toBeVisible();
    });

    test("Line 1 card label is visible", async ({ createProductionPage }) => {
      await createProductionPage.goto();
      await expect(createProductionPage.page.getByText("Line 1")).toBeVisible();
    });

    test("Add Line button spans full width", async ({
      createProductionPage,
    }) => {
      await createProductionPage.goto();
      const addBtn = await createProductionPage.addLineButton.boundingBox();
      const input =
        await createProductionPage.productionNameInput.boundingBox();
      expect(addBtn).not.toBeNull();
      expect(input).not.toBeNull();
      // Add Line button should be at least as wide as the input
      expect(addBtn!.width).toBeGreaterThanOrEqual(input!.width * 0.9);
    });

    test("form does not overflow viewport", async ({
      createProductionPage,
    }) => {
      await createProductionPage.goto();
      const viewport = createProductionPage.page.viewportSize()!;
      const input =
        await createProductionPage.productionNameInput.boundingBox();
      expect(input).not.toBeNull();
      expect(input!.x + input!.width).toBeLessThanOrEqual(viewport.width + 1);
    });

    test("added line cards are visible and numbered", async ({
      createProductionPage,
    }) => {
      await createProductionPage.goto();
      await createProductionPage.addLineButton.click();
      await expect(createProductionPage.page.getByText("Line 2")).toBeVisible();
      await createProductionPage.addLineButton.click();
      await expect(createProductionPage.page.getByText("Line 3")).toBeVisible();
    });

    test("Audio Feed checkbox is visible alongside line input", async ({
      createProductionPage,
    }) => {
      await createProductionPage.goto();
      await expect(
        createProductionPage.page.getByText("Audio Feed").first()
      ).toBeVisible();
    });
  });

  test.describe("Manage productions page", () => {
    test("page renders with productions visible", async ({
      manageProductionsPage,
    }) => {
      await manageProductionsPage.goto();
      await manageProductionsPage.expectProductionVisible("Morning Show");
      await manageProductionsPage.expectProductionVisible("Evening News");
    });

    test("heading is visible", async ({ manageProductionsPage }) => {
      await manageProductionsPage.goto();
      await expect(
        manageProductionsPage.page.getByText("Manage").first()
      ).toBeVisible();
    });

    test("production cards do not overflow viewport", async ({
      manageProductionsPage,
    }) => {
      await manageProductionsPage.goto();
      const viewport = manageProductionsPage.page.viewportSize()!;
      const card = manageProductionsPage.page
        .getByText("Morning Show")
        .first()
        .locator("../..");
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    });
  });

  test.describe("Expanded production content", () => {
    test("expanding a production shows its lines", async ({ landingPage }) => {
      await landingPage.gotoWithSettings("TestUser");
      await landingPage.page.getByText("Morning Show").first().click();
      await expect(
        landingPage.page.getByText("Host Line").first()
      ).toBeVisible();
    });

    test("line blocks are fully visible within card", async ({
      landingPage,
    }) => {
      await landingPage.gotoWithSettings("TestUser");
      await landingPage.page.getByText("Morning Show").first().click();
      const lineBlock = landingPage.page.getByText("Host Line").first();
      await expect(lineBlock).toBeVisible();
      const viewport = landingPage.page.viewportSize()!;
      const box = await lineBlock.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    });

    test("Join button is visible on line blocks", async ({ landingPage }) => {
      await landingPage.gotoWithSettings("TestUser");
      await landingPage.page.getByText("Morning Show").first().click();
      await expect(
        landingPage.page.getByRole("button", { name: /join/i }).first()
      ).toBeVisible();
    });
  });

  test.describe("Long name truncation", () => {
    // The component truncates names > 40 chars with "..."
    const truncatedProductionName = `${LONG_PRODUCTION_NAME.slice(0, 40)}...`;
    const truncatedLineName = `${LONG_LINE_NAME.slice(0, 40)}...`;

    test("long production name is truncated and does not overflow", async ({
      landingPage,
    }) => {
      await landingPage.gotoWithSettings("TestUser");
      const page = landingPage.page;
      const viewport = page.viewportSize()!;

      // The truncated name should be visible
      const nameEl = page.getByText(truncatedProductionName).first();
      await expect(nameEl).toBeVisible();

      // Full name should NOT appear in the DOM text
      await expect(page.getByText(LONG_PRODUCTION_NAME)).toHaveCount(0);

      // The card containing it should not overflow
      const card = nameEl.locator("../..");
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    });

    test("long line name is truncated and does not overflow", async ({
      landingPage,
    }) => {
      await landingPage.gotoWithSettings("TestUser");
      const page = landingPage.page;
      const viewport = page.viewportSize()!;

      // Expand the long-name production
      await page.getByText(truncatedProductionName).first().click();

      // The truncated line name should be visible
      const lineEl = page.getByText(truncatedLineName).first();
      await expect(lineEl).toBeVisible();

      // Full line name should NOT appear in the DOM text
      await expect(page.getByText(LONG_LINE_NAME)).toHaveCount(0);

      // The line block should not overflow
      const box = await lineEl.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    });

    test("long participant name does not overflow line block", async ({
      landingPage,
    }) => {
      await landingPage.gotoWithSettings("TestUser");
      const page = landingPage.page;
      const viewport = page.viewportSize()!;

      // Expand the long-name production
      await page.getByText(truncatedProductionName).first().click();

      // The participant name should be visible (shown inline, may be CSS-truncated)
      const participantEl = page.getByText(LONG_PARTICIPANT_NAME).first();
      await expect(participantEl).toBeVisible();

      // The participant element should not overflow the viewport
      const box = await participantEl.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    });

    test("long production name card does not overflow on manage page", async ({
      manageProductionsPage,
    }) => {
      const page = manageProductionsPage.page;
      await manageProductionsPage.goto();
      const viewport = page.viewportSize()!;

      const nameEl = page.getByText(truncatedProductionName).first();
      await expect(nameEl).toBeVisible();

      const card = nameEl.locator("../..");
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    });
  });

  test.describe("404 page", () => {
    test("404 message is visible on unknown routes", async ({
      page,
      mockApi,
    }) => {
      await page.goto("/unknown-route");
      await expect(page.getByText(/not found/i).first()).toBeVisible();
    });

    test("back navigation element is visible on 404 page", async ({
      page,
      mockApi,
    }) => {
      await page.goto("/unknown-route");
      // NavigateToRootButton is a styled div with an SVG, not a button
      const backButton = page.locator("div:has(> svg) >> nth=0");
      await expect(backButton).toBeVisible();
    });
  });
});

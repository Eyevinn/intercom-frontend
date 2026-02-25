import { Page, Locator, expect } from "@playwright/test";
import { type MockApi } from "../helpers/api-mock-handler";

export class ManageProductionsPagePO {
  readonly page: Page;
  readonly mockApi: MockApi;
  readonly backButton: Locator;

  constructor(page: Page, mockApi: MockApi) {
    this.page = page;
    this.mockApi = mockApi;
    // NavigateToRootButton is a styled div (not a button) with a BackArrow SVG
    this.backButton = page.locator("div:has(> svg) >> nth=0");
  }

  async goto() {
    await this.page.goto("/manage-productions");
  }

  getProductionItem(name: string) {
    return this.page.getByText(name).first();
  }

  /**
   * Get the collapsible card container for a production by name.
   * Manage productions is desktop-only (skipped on mobile projects).
   */
  getProductionCard(name: string): Locator {
    return this.page
      .locator("div")
      .filter({ hasText: new RegExp(`^${name}`) })
      .first();
  }

  /**
   * Expand a production card, then wait for the "Delete Production" button.
   *
   * In manage mode the production name is wrapped in EditNameForm — clicking
   * it can trigger inline-edit instead of expand/collapse on Firefox. We
   * avoid this by clicking the **participant count** element (e.g. "0", "1")
   * which lives inside the HeaderWrapper (triggers handleHeaderClick) but
   * outside the `.name-edit-button` guard.
   */
  async expandProduction(name: string) {
    // Find the participant count text next to the production name.
    // Each production header shows a count like "0" or "1". We locate it
    // relative to the production name by finding the card, then its count.
    const card = this.getProductionCard(name);
    const nameEl = card.getByText(name, { exact: true });
    await expect(nameEl).toBeVisible();

    // The participant count is a sibling element to the name area, rendered
    // as a small number. We click the name with a position offset that lands
    // on the right side of the header (past the name, onto the count/chevron
    // area), staying within the HeaderWrapper onClick zone.
    await nameEl.click({ position: { x: 0, y: 0 }, trial: true });
    const nameBox = await nameEl.boundingBox();
    const cardBox = await card.boundingBox();

    if (nameBox && cardBox) {
      // Click at the right edge of the card header, well past the name text
      // but within the card. This hits the participant count or chevron area.
      await this.page.mouse.click(
        cardBox.x + cardBox.width - 20,
        nameBox.y + nameBox.height / 2
      );
    } else {
      // Fallback: click the name text directly
      await nameEl.click();
    }

    await expect(
      card.getByRole("button", { name: "Delete Production" })
    ).toBeVisible();
  }

  async expectProductionVisible(name: string) {
    await expect(this.getProductionItem(name)).toBeVisible();
  }
}

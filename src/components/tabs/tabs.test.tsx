import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Tabs, TTab } from "./tabs";

const sampleTabs: TTab[] = [
  { id: "devices", label: "Devices", content: <p>Devices content</p> },
  { id: "profile", label: "Profile", content: <p>Profile content</p> },
  { id: "hotkeys", label: "Hotkeys", content: <p>Hotkeys content</p> },
];

describe("Tabs", () => {
  it("renders a tab for each entry", () => {
    render(<Tabs tabs={sampleTabs} ariaLabel="Settings" />);

    expect(
      screen.getByRole("tablist", { name: "Settings" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("shows the first tab panel by default and hides the rest", () => {
    render(<Tabs tabs={sampleTabs} />);

    expect(screen.getByText("Devices content")).toBeVisible();
    expect(screen.getByText("Profile content")).not.toBeVisible();
    expect(screen.getByRole("tab", { name: "Devices" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("respects defaultTabId when uncontrolled", () => {
    render(<Tabs tabs={sampleTabs} defaultTabId="profile" />);

    expect(screen.getByText("Profile content")).toBeVisible();
    expect(screen.getByText("Devices content")).not.toBeVisible();
  });

  it("switches panels when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<Tabs tabs={sampleTabs} onTabChange={onTabChange} />);

    await user.click(screen.getByRole("tab", { name: "Hotkeys" }));

    expect(screen.getByText("Hotkeys content")).toBeVisible();
    expect(screen.getByText("Devices content")).not.toBeVisible();
    expect(onTabChange).toHaveBeenCalledWith("hotkeys");
  });

  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={sampleTabs} />);

    await user.click(screen.getByRole("tab", { name: "Devices" }));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Profile" })).toHaveFocus();
    expect(screen.getByText("Profile content")).toBeVisible();

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Devices" })).toHaveFocus();
  });

  it("does not activate a disabled tab", async () => {
    const user = userEvent.setup();
    const tabs: TTab[] = [
      { id: "a", label: "A", content: <p>A content</p> },
      { id: "b", label: "B", content: <p>B content</p>, disabled: true },
    ];
    render(<Tabs tabs={tabs} />);

    const disabledTab = screen.getByRole("tab", { name: "B" });
    expect(disabledTab).toBeDisabled();

    await user.click(disabledTab);
    expect(screen.getByText("A content")).toBeVisible();
    expect(screen.getByText("B content")).not.toBeVisible();
  });

  it("supports controlled usage via activeTabId", async () => {
    const user = userEvent.setup();

    const Controlled = () => {
      const [active, setActive] = useState("devices");
      return (
        <Tabs tabs={sampleTabs} activeTabId={active} onTabChange={setActive} />
      );
    };

    render(<Controlled />);
    expect(screen.getByText("Devices content")).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Profile" }));
    expect(screen.getByText("Profile content")).toBeVisible();
  });
});

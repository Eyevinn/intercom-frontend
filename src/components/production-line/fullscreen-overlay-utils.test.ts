import { describe, expect, it } from "vitest";
import { isRemoteVideoTile } from "./fullscreen-overlay-utils";

const makeRemoteTile = (): HTMLElement => {
  const container = document.createElement("div");
  const label = document.createElement("span");
  label.dataset.videoTileLabel = "true";
  container.appendChild(label);
  return container;
};

describe("isRemoteVideoTile", () => {
  it("returns false for null / non-element values", () => {
    expect(isRemoteVideoTile(null, null)).toBe(false);
    expect(isRemoteVideoTile(undefined, null)).toBe(false);
  });

  it("returns false for the self-preview tile (no video-tile-label child)", () => {
    const selfTile = document.createElement("div");
    selfTile.appendChild(document.createElement("video"));
    expect(isRemoteVideoTile(selfTile, null)).toBe(false);
  });

  it("returns true for a remote tile container with a label child", () => {
    expect(isRemoteVideoTile(makeRemoteTile(), null)).toBe(true);
  });

  it("returns true when the remote tile lives inside the provided grid", () => {
    const grid = document.createElement("div");
    const tile = makeRemoteTile();
    grid.appendChild(tile);
    expect(isRemoteVideoTile(tile, grid)).toBe(true);
  });

  it("returns false when the tile is NOT contained in the provided grid", () => {
    const grid = document.createElement("div");
    const tile = makeRemoteTile(); // not appended to grid
    expect(isRemoteVideoTile(tile, grid)).toBe(false);
  });
});

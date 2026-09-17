import { describe, it, expect } from "vitest";
import {
  computeVideoTileLabels,
  LabelResult,
  ParticipantInfo,
  TileEndpointInfo,
} from "./match-video-tile-labels.ts";

// Test factories — keep tests readable. participant() defaults to a
// remote, active, non-WHIP user with video so each test only specifies
// what differs.
const participant = (
  overrides: Partial<ParticipantInfo> & { sessionId: string }
): ParticipantInfo => ({
  name: `user-${overrides.sessionId}`,
  endpointId: `ep-${overrides.sessionId}`,
  isActive: true,
  isWhip: false,
  hasVideo: true,
  ...overrides,
});

const tile = (
  endpointId: string,
  previousSessionId: string | null = null
): TileEndpointInfo => ({ endpointId, previousSessionId });

// Convenience: build the LabelResult for a tile that matched a given
// participant. Saves repeating { name, isWhip, sessionId } at every call.
const matched = (p: ParticipantInfo): LabelResult => ({
  name: p.name,
  isWhip: p.isWhip,
  sessionId: p.sessionId,
});

const blank: LabelResult = { name: null, isWhip: false, sessionId: null };

const SELF = "self-session";

describe("computeVideoTileLabels", () => {
  it("returns no labels when there are no tiles", () => {
    const out = computeVideoTileLabels(
      [],
      [participant({ sessionId: "a" })],
      SELF
    );
    expect(out).toEqual([]);
  });

  describe("phase 1: precise endpointId match", () => {
    it("labels a tile whose endpointId matches a participant", () => {
      const p = participant({ sessionId: "a" });
      const out = computeVideoTileLabels([tile(p.endpointId)], [p], SELF);
      expect(out).toEqual([matched(p)]);
    });

    it("labels each of multiple tiles that all match precisely", () => {
      const a = participant({ sessionId: "a" });
      const b = participant({ sessionId: "b", isWhip: true });
      const c = participant({ sessionId: "c" });
      const out = computeVideoTileLabels(
        [tile(a.endpointId), tile(b.endpointId), tile(c.endpointId)],
        [a, b, c],
        SELF
      );
      expect(out).toEqual([matched(a), matched(b), matched(c)]);
    });

    it("preserves input tile order in the output", () => {
      const a = participant({ sessionId: "a", name: "Alice" });
      const b = participant({ sessionId: "b", name: "Bob" });
      const out = computeVideoTileLabels(
        [tile(b.endpointId), tile(a.endpointId)],
        [a, b],
        SELF
      );
      expect(out).toEqual([matched(b), matched(a)]);
    });

    it("matches a participant even when they are inactive (precise wins)", () => {
      // The precise endpointId match doesn't care about active state — if
      // the wire-level identity matches, we know who it is.
      const inactive = participant({ sessionId: "a", isActive: false });
      const out = computeVideoTileLabels(
        [tile(inactive.endpointId)],
        [inactive],
        SELF
      );
      expect(out).toEqual([matched(inactive)]);
    });

    it("matches a tile whose endpoint belongs to self", () => {
      // Self exclusion only applies to the phase-2 fallback. If a tile
      // happens to carry a wire id that matches self (unusual but
      // possible), labeling it is still correct.
      const me = participant({ sessionId: SELF, name: "Me" });
      const out = computeVideoTileLabels([tile(me.endpointId)], [me], SELF);
      expect(out).toEqual([matched(me)]);
    });

    it("gives the WHIP styling flag when matching a WHIP participant", () => {
      const w = participant({ sessionId: "w", isWhip: true });
      const out = computeVideoTileLabels([tile(w.endpointId)], [w], SELF);
      expect(out).toEqual([matched(w)]);
    });

    it("reports the matched participant's sessionId on the tile result", () => {
      // sessionId on the result is what callers use to decide pin-button
      // visibility in the user list (only participants with a tile get a
      // pin button).
      const p = participant({ sessionId: "a" });
      const [result] = computeVideoTileLabels([tile(p.endpointId)], [p], SELF);
      expect(result.sessionId).toBe(p.sessionId);
    });
  });

  describe("phase 2: single-leftover fallback", () => {
    it("labels a single unmatched tile when exactly one remote active participant is left", () => {
      // Common case: one browser cam matched, one WHIP tile unmatched
      // (msid stripped by ssrc-rewrite), and exactly one WHIP participant
      // in the list.
      const cam = participant({ sessionId: "cam" });
      const whip = participant({ sessionId: "whip", isWhip: true });
      const out = computeVideoTileLabels(
        [tile(cam.endpointId), tile("opaque-uuid-from-smb")],
        [cam, whip],
        SELF
      );
      expect(out).toEqual([matched(cam), matched(whip)]);
    });

    it("labels a single tile with empty endpointId when one WHIP participant is left", () => {
      // Defensive: tile without dataset (empty endpointId) still falls
      // through to the unambiguous-pair rule, provided the only
      // remaining candidate is WHIP-flagged.
      const onlyWhip = participant({ sessionId: "only", isWhip: true });
      const out = computeVideoTileLabels([tile("")], [onlyWhip], SELF);
      expect(out).toEqual([matched(onlyWhip)]);
    });

    it("does NOT fall back to a non-publishing participant", () => {
      // The fallback pool is restricted to active hasVideo participants —
      // audio-only joiners and other non-publishers must not be guessed
      // at, even if they're the only unmatched leftover.
      const audioOnly = participant({ sessionId: "audio", hasVideo: false });
      const out = computeVideoTileLabels([tile("opaque")], [audioOnly], SELF);
      expect(out).toEqual([blank]);
    });

    it("populates sessionId on the fallback-matched tile", () => {
      // The pin-button-visibility logic depends on this being set even
      // for the phase-2 fallback path (otherwise the WHIP tile, which
      // only ever matches via fallback, would lose its pin button).
      const whip = participant({ sessionId: "whip", isWhip: true });
      const [result] = computeVideoTileLabels([tile("opaque")], [whip], SELF);
      expect(result.sessionId).toBe(whip.sessionId);
    });
  });

  describe("audio-only joiners (the regression fix)", () => {
    it("keeps the WHIP label when an audio-only third user joins", () => {
      // Reproduces the reported bug: operator + WHIP works fine, then a
      // third user joins audio-only. They appear in the participant list
      // but produce no tile. With the previous loose filter this caused
      // 1 unmatched tile + 2 unmatched participants → ambiguous → WHIP
      // label dropped. Restricting to isWhip-flagged candidates keeps
      // the label.
      const whip = participant({
        sessionId: "whip",
        name: "Field Camera",
        isWhip: true,
      });
      const audioOnly = participant({
        sessionId: "audio-only",
        isWhip: false,
        hasVideo: false,
      });
      const out = computeVideoTileLabels(
        [tile("opaque")],
        [whip, audioOnly],
        SELF
      );
      expect(out).toEqual([matched(whip)]);
    });

    it("keeps the WHIP label even with multiple audio-only joiners", () => {
      const whip = participant({
        sessionId: "whip",
        name: "WHIP Source",
        isWhip: true,
      });
      const audio1 = participant({
        sessionId: "a1",
        isWhip: false,
        hasVideo: false,
      });
      const audio2 = participant({
        sessionId: "a2",
        isWhip: false,
        hasVideo: false,
      });
      const audio3 = participant({
        sessionId: "a3",
        isWhip: false,
        hasVideo: false,
      });
      const out = computeVideoTileLabels(
        [tile("opaque")],
        [whip, audio1, audio2, audio3],
        SELF
      );
      expect(out).toEqual([matched(whip)]);
    });

    it("labels precise-matched browser cams while audio-only joiners are present, plus the WHIP fallback", () => {
      // Realistic mid-call composition: 1 browser cam (precise match),
      // 1 WHIP (fallback), and 2 audio-only listeners (ignored via
      // hasVideo:false).
      const cam = participant({ sessionId: "cam", name: "Cam User" });
      const whip = participant({
        sessionId: "whip",
        name: "WHIP",
        isWhip: true,
      });
      const audio1 = participant({ sessionId: "a1", hasVideo: false });
      const audio2 = participant({ sessionId: "a2", hasVideo: false });
      const out = computeVideoTileLabels(
        [tile(cam.endpointId), tile("opaque")],
        [cam, whip, audio1, audio2, participant({ sessionId: SELF })],
        SELF
      );
      expect(out).toEqual([matched(cam), matched(whip)]);
    });

    it("does NOT report a sessionId for audio-only joiners (no pin button)", () => {
      // Used to gate the user-list pin button — only participants with a
      // sessionId reported on a tile result deserve a pin button.
      const whip = participant({ sessionId: "whip", isWhip: true });
      const audioOnly = participant({
        sessionId: "audio-only",
        hasVideo: false,
      });
      const out = computeVideoTileLabels(
        [tile("opaque")],
        [whip, audioOnly],
        SELF
      );
      const reportedSessionIds = out
        .map((r) => r.sessionId)
        .filter((sid): sid is string => sid !== null);
      expect(reportedSessionIds).toEqual([whip.sessionId]);
      expect(reportedSessionIds).not.toContain(audioOnly.sessionId);
    });
  });

  describe("safety: never label when ambiguous", () => {
    it("leaves all leftover tiles blank when 2 tiles + 2 participants are unmatched", () => {
      // Two-of-each ambiguity. Either tile could belong to either
      // participant; neither labeling is provably correct.
      const a = participant({ sessionId: "a" });
      const b = participant({ sessionId: "b" });
      const out = computeVideoTileLabels(
        [tile("opaque-1"), tile("opaque-2")],
        [a, b],
        SELF
      );
      expect(out).toEqual([blank, blank]);
    });

    it("leaves a tile blank when there are no unmatched participants", () => {
      // 1 unmatched tile, 0 unmatched participants — nothing legitimate
      // to pair with.
      const m = participant({ sessionId: "matched" });
      const out = computeVideoTileLabels(
        [tile(m.endpointId), tile("orphan-tile")],
        [m],
        SELF
      );
      expect(out).toEqual([matched(m), blank]);
    });

    it("does not label leftover tiles when there are 0 of them but unmatched participants exist", () => {
      // Mirror image: nothing to label.
      const a = participant({ sessionId: "a" });
      const out = computeVideoTileLabels([tile(a.endpointId)], [a], SELF);
      expect(out).toEqual([matched(a)]);
    });

    it("excludes self from the unmatched-participant pool in phase 2", () => {
      // Self has a phantom unmatched session in the list; the tile must
      // NOT be labeled with the operator's own name.
      const me = participant({ sessionId: SELF, name: "Me" });
      const out = computeVideoTileLabels([tile("opaque")], [me], SELF);
      expect(out).toEqual([blank]);
    });

    it("excludes inactive participants from the unmatched pool in phase 2", () => {
      // An inactive ghost session shouldn't be eligible for fallback
      // pairing — they're not actually publishing.
      const ghost = participant({ sessionId: "ghost", isActive: false });
      const out = computeVideoTileLabels([tile("opaque")], [ghost], SELF);
      expect(out).toEqual([blank]);
    });

    it("excludes participants already matched in phase 1 from the unmatched pool", () => {
      // a is matched precisely; the ambiguous leftover (1 tile + 1
      // unmatched remaining = b) should still pair safely.
      const a = participant({ sessionId: "a" });
      const b = participant({ sessionId: "b", isWhip: true });
      const out = computeVideoTileLabels(
        [tile(a.endpointId), tile("opaque")],
        [a, b],
        SELF
      );
      expect(out).toEqual([matched(a), matched(b)]);
    });

    it("does not label any leftover tile when 1 tile + 2 unmatched participants", () => {
      // Asymmetric ambiguity — tile could belong to either of two
      // candidates. Refuse to guess.
      const a = participant({ sessionId: "a" });
      const b = participant({ sessionId: "b" });
      const out = computeVideoTileLabels([tile("opaque")], [a, b], SELF);
      expect(out).toEqual([blank]);
    });

    it("does not label any leftover tile when 2 tiles + 1 unmatched participant", () => {
      // Mirror: one participant could match either of two tiles.
      const a = participant({ sessionId: "a" });
      const out = computeVideoTileLabels(
        [tile("opaque-1"), tile("opaque-2")],
        [a],
        SELF
      );
      expect(out).toEqual([blank, blank]);
    });
  });

  describe("realistic mixed scenarios", () => {
    it("labels precise matches and the single fallback together", () => {
      // 2 browser cams matched precisely + 1 WHIP tile via fallback.
      const cam1 = participant({ sessionId: "cam1", name: "Cam 1" });
      const cam2 = participant({ sessionId: "cam2", name: "Cam 2" });
      const whip = participant({
        sessionId: "whip",
        name: "Field Camera",
        isWhip: true,
      });
      const out = computeVideoTileLabels(
        [tile(cam1.endpointId), tile("opaque"), tile(cam2.endpointId)],
        [cam1, cam2, whip, participant({ sessionId: SELF, name: "Self" })],
        SELF
      );
      expect(out).toEqual([matched(cam1), matched(whip), matched(cam2)]);
    });

    it("falls back safely when the participant list lags behind a new joiner", () => {
      // Backend hasn't yet exposed the joiner in /line polling. Tile
      // arrives with an unrecognized endpointId. With no other unmatched
      // participants we leave it blank rather than guessing.
      const cam = participant({ sessionId: "cam" });
      const out = computeVideoTileLabels(
        [tile(cam.endpointId), tile("brand-new-id")],
        [cam],
        SELF
      );
      expect(out).toEqual([matched(cam), blank]);
    });
  });

  describe("previously-bound tiles (orphan, not Phase 2 candidate)", () => {
    it("does not relabel a tile bound to a now-departed publisher when a new publisher joins", () => {
      // Reproduces the WHIP-after-leave bug: Sandra and Elsa were both
      // publishing; Sandra leaves, polling reflects her absence, then a
      // WHIP source joins. The polling response can update participants
      // before the WHIP track event arrives. Without this guard, Phase 2
      // would pair Sandra's still-existing tile (1 unmatched) with WHIP
      // (1 leftover hasVideo) and the user would see Sandra's frozen
      // last frame under WHIP's name tag.
      const elsa = participant({ sessionId: "elsa", name: "Elsa" });
      const whip = participant({
        sessionId: "whip",
        name: "Field Camera",
        isWhip: true,
      });
      const sandraEndpoint = "ep-sandra";
      const out = computeVideoTileLabels(
        [tile(elsa.endpointId), tile(sandraEndpoint, "sandra")],
        [elsa, whip],
        SELF
      );
      expect(out).toEqual([matched(elsa), blank]);
    });

    it("still allows Phase 1 to resurrect a bound tile when its publisher returns", () => {
      // The previousSessionId guard only blocks Phase 2 fallback; an
      // exact endpointId match (Phase 1) is unambiguous and should win
      // even on a previously-bound tile.
      const cam = participant({ sessionId: "cam", name: "Cam" });
      const out = computeVideoTileLabels(
        [tile(cam.endpointId, cam.sessionId)],
        [cam],
        SELF
      );
      expect(out).toEqual([matched(cam)]);
    });

    it("stably rebinds a bound tile to the same session when that session is still alive", () => {
      const whip = participant({
        sessionId: "whip",
        name: "Field Camera",
        isWhip: true,
      });
      const out = computeVideoTileLabels(
        [tile("opaque-old", "whip")],
        [whip],
        SELF
      );
      expect(out).toEqual([matched(whip)]);
    });

    it("does NOT rebind a bound tile when its session has departed", () => {
      const departed = "departed-session";
      const someone = participant({ sessionId: "someone-else" });
      const out = computeVideoTileLabels(
        [tile("opaque-old", departed), tile(someone.endpointId)],
        [someone],
        SELF
      );
      expect(out).toEqual([blank, matched(someone)]);
    });

    it("does NOT rebind to a session that another tile already claimed in Phase 1", () => {
      const cam = participant({ sessionId: "cam", name: "Cam" });
      const out = computeVideoTileLabels(
        [tile("opaque-old", "cam"), tile(cam.endpointId)],
        [cam],
        SELF
      );
      expect(out).toEqual([blank, matched(cam)]);
    });

    it("still labels a fresh unmatched tile via Phase 2 when an orphan tile sits alongside it", () => {
      const whip = participant({
        sessionId: "whip",
        name: "WHIP",
        isWhip: true,
      });
      const out = computeVideoTileLabels(
        [tile("orphan-opaque", "departed"), tile("fresh-opaque")],
        [whip],
        SELF
      );
      expect(out).toEqual([blank, matched(whip)]);
    });
  });
});

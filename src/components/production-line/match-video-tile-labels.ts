export type TileEndpointInfo = {
  endpointId: string;
  previousSessionId: string | null;
};

export type ParticipantInfo = {
  name: string;
  sessionId: string;
  endpointId: string;
  isActive: boolean;
  isWhip: boolean;
  hasVideo: boolean;
};

export type LabelResult = {
  name: string | null;
  isWhip: boolean;
  sessionId: string | null;
};

const blank = (): LabelResult => ({
  name: null,
  isWhip: false,
  sessionId: null,
});

export const computeVideoTileLabels = (
  tiles: TileEndpointInfo[],
  participants: ParticipantInfo[],
  selfSessionId: string | null
): LabelResult[] => {
  const results: LabelResult[] = tiles.map(blank);

  // Phase 1 — precise endpointId match.
  const matchedTileIndices = new Set<number>();
  const matchedSessionIds = new Set<string>();
  tiles.forEach((tile, i) => {
    if (!tile.endpointId) return;
    const participant = participants.find(
      (p) => p.endpointId === tile.endpointId
    );
    if (participant) {
      results[i] = {
        name: participant.name,
        isWhip: participant.isWhip,
        sessionId: participant.sessionId,
      };
      matchedTileIndices.add(i);
      matchedSessionIds.add(participant.sessionId);
    }
  });

  tiles.forEach((tile, i) => {
    if (matchedTileIndices.has(i)) return;
    if (tile.previousSessionId === null) return;
    const p = participants.find(
      (q) => q.sessionId === tile.previousSessionId && q.isActive && q.hasVideo
    );
    if (!p) return;
    if (matchedSessionIds.has(p.sessionId)) return;
    results[i] = {
      name: p.name,
      isWhip: p.isWhip,
      sessionId: p.sessionId,
    };
    matchedTileIndices.add(i);
    matchedSessionIds.add(p.sessionId);
  });

  const remainingTileIndices: number[] = [];
  tiles.forEach((tile, i) => {
    if (matchedTileIndices.has(i)) return;
    if (tile.previousSessionId !== null) return;
    remainingTileIndices.push(i);
  });
  const remainingPublishers = participants.filter(
    (p) =>
      p.hasVideo &&
      p.sessionId !== selfSessionId &&
      p.isActive &&
      !matchedSessionIds.has(p.sessionId)
  );

  if (remainingTileIndices.length === 1 && remainingPublishers.length === 1) {
    const [idx] = remainingTileIndices;
    const [p] = remainingPublishers;
    results[idx] = {
      name: p.name,
      isWhip: p.isWhip,
      sessionId: p.sessionId,
    };
  }

  return results;
};

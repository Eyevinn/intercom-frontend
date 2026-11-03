import { TParticipant } from "./types.ts";

export const getPinnableParticipants = (
  participants: TParticipant[],
  selfSessionId: string | null
): TParticipant[] =>
  participants.filter(
    (p) =>
      p.sessionId !== selfSessionId &&
      p.isActive &&
      p.hasVideo &&
      !p.isWhepReceiver
  );

export const hasRemoteVideoPublisher = (
  participants: TParticipant[],
  selfSessionId: string | null
): boolean => getPinnableParticipants(participants, selfSessionId).length > 0;

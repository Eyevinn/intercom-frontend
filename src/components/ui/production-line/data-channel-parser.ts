/**
 * Pure function to parse data channel messages from SMB conferences.
 * Extracted from use-rtc-connection.ts lines 149-201.
 */

export type DominantSpeakerMessage = {
  type: "DominantSpeaker";
  endpoint: string;
};

export type EndpointMessage = {
  type: "EndpointMessage";
  payload: {
    muteParticipant?: string;
    forceDisconnect?: string;
    // Advisory global-mute state broadcast (#678). `muteState` is "mute" |
    // "unmute" and `participantId` is the endpointId the state refers to. This
    // is broadcast to ALL endpoints so every client can reflect the mute state
    // in its participant list; it is distinct from `muteParticipant`, which is
    // a targeted directive telling a single endpoint to mute its own input.
    muteState?: string;
    participantId?: string;
  };
  to: string;
  from: string;
};

/**
 * Result of parsing a global-mute-state broadcast (#678): which participant the
 * state refers to (by endpointId) and whether they are now muted.
 */
export type MuteStateBroadcast = {
  participantId: string;
  muted: boolean;
};

export type ParsedDataChannelMessage =
  | DominantSpeakerMessage
  | EndpointMessage
  | { type: "unknown" };

export const parseDataChannelMessage = (
  data: string
): ParsedDataChannelMessage => {
  let message: unknown;

  try {
    message = JSON.parse(data);
  } catch {
    return { type: "unknown" };
  }

  if (
    message &&
    typeof message === "object" &&
    "type" in message &&
    message.type === "DominantSpeaker" &&
    "endpoint" in message &&
    typeof message.endpoint === "string"
  ) {
    return message as DominantSpeakerMessage;
  }

  if (
    message &&
    typeof message === "object" &&
    "type" in message &&
    message.type === "EndpointMessage" &&
    "payload" in message &&
    "to" in message &&
    "from" in message &&
    message.payload &&
    typeof message.payload === "object" &&
    (("muteParticipant" in message.payload &&
      typeof message.payload.muteParticipant === "string") ||
      ("forceDisconnect" in message.payload &&
        typeof message.payload.forceDisconnect === "string") ||
      ("muteState" in message.payload &&
        typeof message.payload.muteState === "string" &&
        "participantId" in message.payload &&
        typeof message.payload.participantId === "string"))
  ) {
    return message as EndpointMessage;
  }

  return { type: "unknown" };
};

/**
 * Determine if the participant should be remotely muted based on an EndpointMessage.
 */
export const isRemoteMute = (msg: EndpointMessage): boolean =>
  msg.payload.muteParticipant === "mute" && msg.to !== msg.from;

/**
 * Determine if the participant was force-disconnected (kicked) by another
 * client based on an EndpointMessage. Mirrors `isRemoteMute`: the message must
 * carry the `forceDisconnect` command and must not be a self-addressed echo.
 */
export const isForceDisconnect = (msg: EndpointMessage): boolean =>
  msg.payload.forceDisconnect === "disconnect" && msg.to !== msg.from;

/**
 * Extract an advisory global-mute-state broadcast (#678) from an
 * EndpointMessage, or `null` if this message is not a mute-state broadcast.
 *
 * This is the receive side of option (a) from issue #678: an admin broadcasts
 * the mute state of a participant to every endpoint so each client can show the
 * correct mute indication in its participant list. It carries NO enforcement —
 * the model is intentionally advisory, matching the already-merged
 * `muteParticipant` directive, which only asks the target to mute itself. A
 * muted participant can still unmute locally; nothing here prevents that.
 *
 * Deferred follow-up (option (b), out of scope for #678): an
 * authoritative/server-enforced mute that persists per-participant admin-mute
 * state in the backend and prevents self-unmute. That requires a new product
 * decision and is intentionally NOT implemented here.
 */
export const getMuteStateBroadcast = (
  msg: EndpointMessage
): MuteStateBroadcast | null => {
  if (
    typeof msg.payload.muteState === "string" &&
    typeof msg.payload.participantId === "string"
  ) {
    return {
      participantId: msg.payload.participantId,
      muted: msg.payload.muteState === "mute",
    };
  }

  return null;
};

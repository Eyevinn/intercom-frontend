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
  payload: { muteParticipant?: string; forceDisconnect?: string };
  to: string;
  from: string;
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
        typeof message.payload.forceDisconnect === "string"))
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

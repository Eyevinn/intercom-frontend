// SMB "pinned video" selection, sent over the conference data channel.
export const sendPinnedEndpoint = (
  dataChannel: RTCDataChannel | null,
  endpointId: string | null
): boolean => {
  if (!dataChannel || dataChannel.readyState !== "open") return false;

  const message = endpointId
    ? { type: "PinnedEndpointsChanged", pinnedEndpoints: [endpointId] }
    : { type: "PinnedEndpointsChanged" };

  try {
    dataChannel.send(JSON.stringify(message));
    return true;
  } catch {
    return false;
  }
};

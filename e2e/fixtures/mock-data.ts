export type MockParticipant = {
  name: string;
  sessionId: string;
  endpointId: string;
  isActive: boolean;
  isWhip: boolean;
};

export type MockLine = {
  name: string;
  id: string;
  smbConferenceId: string;
  participants: MockParticipant[];
  programOutputLine: boolean;
};

export type MockProduction = {
  name: string;
  productionId: string;
  lines: MockLine[];
};

export const mockProductions: MockProduction[] = [
  {
    name: "Morning Show",
    productionId: "1",
    lines: [
      {
        name: "Host Line",
        id: "10",
        smbConferenceId: "conf-10",
        participants: [
          {
            name: "Alice",
            sessionId: "sess-1",
            endpointId: "ep-1",
            isActive: true,
            isWhip: false,
          },
        ],
        programOutputLine: false,
      },
      {
        name: "Guest Line",
        id: "11",
        smbConferenceId: "conf-11",
        participants: [],
        programOutputLine: false,
      },
    ],
  },
  {
    name: "Evening News",
    productionId: "2",
    lines: [
      {
        name: "Anchor",
        id: "20",
        smbConferenceId: "conf-20",
        participants: [],
        programOutputLine: false,
      },
    ],
  },
];

export const mockSessionResponse = {
  sdp: [
    "v=0",
    "o=- 0 0 IN IP4 127.0.0.1",
    "s=-",
    "t=0 0",
    "m=audio 9 UDP/TLS/RTP/SAVPF 111",
    "c=IN IP4 0.0.0.0",
    "a=rtcp:9 IN IP4 0.0.0.0",
    "a=mid:0",
    "a=sendrecv",
    "a=rtpmap:111 opus/48000/2",
  ].join("\r\n"),
  sessionId: "mock-session-123",
};

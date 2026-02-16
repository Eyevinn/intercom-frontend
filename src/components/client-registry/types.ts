export type TClientProfile = {
  clientId: string;
  name: string;
  role: string;
  location: string;
  /** Present in REST API responses, absent in WebSocket events */
  isOnline?: boolean;
  /** Present in REST API responses, absent in WebSocket events */
  lastSeenAt?: string;
};

export type TRegistrationForm = {
  name: string;
  role: string;
  location: string;
};

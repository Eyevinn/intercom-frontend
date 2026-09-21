import { useState } from "react";
import { guestSession } from "../utils/guest-session";

export const useIsGuest = (): boolean => {
  const [isGuest] = useState<boolean>(() => guestSession.isGuest());
  return isGuest;
};

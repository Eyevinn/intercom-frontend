import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useIsGuest } from "../../hooks/use-is-guest";
import { guestSession } from "../../utils/guest-session";

type RequireNonGuestProps = {
  children: ReactNode;
};

export const RequireNonGuest = ({ children }: RequireNonGuestProps) => {
  const isGuest = useIsGuest();

  if (isGuest) {
    return <Navigate to={guestSession.getPath() || "/calls"} replace />;
  }

  return children;
};

import { useCallback, useState } from "react";
import { API } from "../api/api.ts";
import { clearRoleAuth, setRoleAuth } from "../api/role-auth-store.ts";
import { useGlobalState } from "../global-state/context-provider.tsx";

// Roles feature (#632): drive the permission request flow.
//
// Calls the manager permission endpoint with the entered role password and, on
// success, stores the password (for the Authorization header) plus the granted
// role and feature flags, mirroring the role/features into global state so the
// UI re-renders. Failures are classified (bad password / rate-limit / server
// error) into a human-readable message without throwing.

const messageForStatus = (status?: number): string => {
  if (status === 401) return "Invalid or unknown role password.";
  if (status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return "Could not verify the role password. Please try again.";
};

export const useRequestPermission = () => {
  const [, dispatch] = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(
    async (password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const { role, features } = await API.requestPermissions({ password });
        setRoleAuth({ password, role, features });
        dispatch({ type: "UPDATE_ROLE_AUTH", payload: { role, features } });
        return true;
      } catch (e) {
        const { status } = e as { status?: number };
        setError(messageForStatus(status));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const clearPermission = useCallback(() => {
    clearRoleAuth();
    dispatch({ type: "UPDATE_ROLE_AUTH", payload: null });
    setError(null);
  }, [dispatch]);

  return { requestPermission, clearPermission, loading, error };
};

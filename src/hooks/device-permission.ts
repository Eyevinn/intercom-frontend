import { useEffect, useState } from "react";

export const useDevicePermissions = () => {
  const [permission, setPermission] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(() => {
        setDenied(false);
        setPermission(true);
      })
      .catch(() => {
        setDenied(true);
        setPermission(false);
      });
  }, []);

  return { permission, denied };
};

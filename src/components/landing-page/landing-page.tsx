import { useEffect, useState } from "react";
import { ProductionsListContainer } from "./productions-list-container.tsx";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { UserSettings } from "../user-settings/user-settings.tsx";
import { UserSettingsButton } from "./user-settings-button.tsx";

export const LandingPage = ({ setApiError }: { setApiError: () => void }) => {
  const [{ apiError }] = useGlobalState();
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

  return (
    <div>
      {((showSettings || !window.localStorage?.getItem("username")) && (
        <UserSettings
          buttonText={showSettings ? "Save" : "Next"}
          onSave={() => setShowSettings(false)}
        />
      )) || (
        <>
          <UserSettingsButton onClick={() => setShowSettings(!showSettings)} />
          <ProductionsListContainer />
        </>
      )}
    </div>
  );
};

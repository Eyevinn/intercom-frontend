import { useEffect, useState } from "react";
import { ProductionsListContainer } from "./productions-list-container.tsx";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { UserSettings } from "../user-settings/user-settings.tsx";
import { UserSettingsButton } from "./user-settings-button.tsx";
import { TUserSettings } from "../user-settings/types.ts";

export const LandingPage = ({ setApiError }: { setApiError: () => void }) => {
  const [{ apiError, userSettings }] = useGlobalState();
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

  const isUserSettingsComplete = (settings: TUserSettings | null) => {
    return (
      settings &&
      settings.username &&
      (settings.audioinput || settings.audiooutput)
    );
  };

  return (
    <div>
      {((showSettings || !isUserSettingsComplete(userSettings)) && (
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

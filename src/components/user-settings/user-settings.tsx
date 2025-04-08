import { FC } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { isMobile } from "../../bowser";
import { UserSettingsForm } from "../user-settings-form/user-settings-form";
import { ResponsiveFormContainer } from "../generic-components";

interface UserSettingsProps {
  buttonText?: string;
  onSave?: () => void;
}

export const UserSettings: FC<UserSettingsProps> = (props) => {
  const { buttonText, onSave } = props;
  const [{ devices, userSettings }] = useGlobalState();

  const defaultValues = {
    username: userSettings?.username,
    audioinput: userSettings?.audioinput,
    audiooutput: userSettings?.audiooutput,
  };

  return (
    <ResponsiveFormContainer className={isMobile ? "" : "desktop"}>
      <DisplayContainerHeader>User Settings</DisplayContainerHeader>
      {devices && (
        <UserSettingsForm
          buttonText={buttonText || "Save"}
          defaultValues={defaultValues}
          onSave={onSave}
          updateUserSettings
        />
      )}
    </ResponsiveFormContainer>
  );
};

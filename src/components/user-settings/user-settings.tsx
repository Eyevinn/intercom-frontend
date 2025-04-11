import { FC } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { UserSettingsForm } from "../user-settings-form/user-settings-form";
import { ResponsiveFormContainer } from "../generic-components";

interface UserSettingsProps {
  buttonText?: string;
  className?: string;
  needsConfirmation?: boolean;
  onSave?: () => void;
}

export const UserSettings: FC<UserSettingsProps> = (props) => {
  const { buttonText, className, onSave, needsConfirmation } = props;
  const [{ devices, userSettings }] = useGlobalState();

  const defaultValues = {
    username: userSettings?.username,
    audioinput: userSettings?.audioinput,
    audiooutput: userSettings?.audiooutput,
  };

  return (
    <ResponsiveFormContainer className={className}>
      <DisplayContainerHeader>User Settings</DisplayContainerHeader>
      {devices && (
        <UserSettingsForm
          buttonText={buttonText || "Save"}
          defaultValues={defaultValues}
          onSave={onSave}
          updateUserSettings
          needsConfirmation={needsConfirmation}
        />
      )}
    </ResponsiveFormContainer>
  );
};

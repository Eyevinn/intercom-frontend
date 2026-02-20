import { FC } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { UserSettingsForm } from "../user-settings-form/user-settings-form";
import { ResponsiveFormContainer } from "../generic-components";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button";
import { HeaderWrapper } from "../create-production/create-production-components";

interface UserSettingsProps {
  buttonText?: string;
  className?: string;
  needsConfirmation?: boolean;
  onSave?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  hideTitle?: boolean;
}

export const UserSettings: FC<UserSettingsProps> = (props) => {
  const {
    buttonText,
    className,
    onSave,
    needsConfirmation,
    showBackButton,
    onBack,
    hideTitle,
  } = props;
  const [{ devices, userSettings }] = useGlobalState();

  const hasBackButton = showBackButton ?? !onSave;

  const defaultValues = {
    username: userSettings?.username,
    audioinput: userSettings?.audioinput,
    audiooutput: userSettings?.audiooutput,
  };

  return (
    <ResponsiveFormContainer className={className}>
      {!hideTitle &&
        (hasBackButton ? (
          <HeaderWrapper>
            <NavigateToRootButton onNavigate={onBack} />
            <DisplayContainerHeader>User Settings</DisplayContainerHeader>
          </HeaderWrapper>
        ) : (
          <DisplayContainerHeader>User Settings</DisplayContainerHeader>
        ))}
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

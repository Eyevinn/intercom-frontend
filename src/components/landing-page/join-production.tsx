import { useState } from "react";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { TJoinProductionOptions } from "../production-line/types.ts";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";
import { isMobile } from "../../bowser.ts";
import { RemoveIcon } from "../../assets/icons/icon.tsx";
import {
  HeaderWrapper,
  HeaderText,
  HeaderExitButton,
} from "./join-production-components.ts";
import { UserSettingsForm } from "../user-settings-form/user-settings-form.tsx";
import { ResponsiveFormContainer } from "../generic-components.ts";

type TProps = {
  preSelected?: {
    preSelectedProductionId: string;
    preSelectedLineId: string;
  };
  customGlobalMute: string;
  addAdditionalCallId?: string;
  closeAddCallView?: () => void;
  className?: string;
  updateUserSettings?: boolean;
  isFirstConnection?: string;
};

export const JoinProduction = ({
  preSelected,
  customGlobalMute,
  addAdditionalCallId,
  closeAddCallView,
  className,
  updateUserSettings = false,
  isFirstConnection,
}: TProps) => {
  const [joinProductionOptions, setJoinProductionOptions] =
    useState<TJoinProductionOptions | null>(null);
  const [isProgramUser, setIsProgramUser] = useState(false);
  const [{ devices, userSettings }] = useGlobalState();

  const defaultValues = {
    productionId:
      preSelected?.preSelectedProductionId || addAdditionalCallId || "",
    lineId: preSelected?.preSelectedLineId || undefined,
    username: userSettings?.username,
    audioinput: userSettings?.audioinput,
    audiooutput: userSettings?.audiooutput,
    lineUsedForProgramOutput: false,
  };

  useNavigateToProduction(joinProductionOptions);

  return (
    <ResponsiveFormContainer
      className={`${isMobile ? "" : "desktop"} ${className}`}
    >
      <HeaderWrapper>
        <HeaderText>Join Production</HeaderText>
        {closeAddCallView && (
          <HeaderExitButton onClick={() => closeAddCallView()}>
            <RemoveIcon />
          </HeaderExitButton>
        )}
      </HeaderWrapper>
      {devices && (
        <UserSettingsForm
          isJoinProduction
          preSelected={preSelected}
          buttonText="Join"
          defaultValues={defaultValues}
          isProgramUser={isProgramUser}
          setIsProgramUser={setIsProgramUser}
          setJoinProductionOptions={setJoinProductionOptions}
          customGlobalMute={customGlobalMute}
          closeAddCallView={closeAddCallView}
          updateUserSettings={updateUserSettings}
          isFirstConnection={isFirstConnection}
        />
      )}
    </ResponsiveFormContainer>
  );
};

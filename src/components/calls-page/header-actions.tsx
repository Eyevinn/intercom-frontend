import styled from "@emotion/styled";
import { useState } from "react";
import { MicMuted, MicUnmuted } from "../../assets/icons/icon";
import { isMobile, isTablet } from "../../bowser";
import { PrimaryButton, SecondaryButton } from "../form-elements/form-elements";
import { ConnectToWSButton } from "./connect-to-ws-button";
import { useGlobalMuteToggle } from "./use-global-mute-toggle";
import { SavePresetModal } from "./save-preset-modal";
import { useGlobalState } from "../../global-state/context-provider";

const AddCallContainer = styled.div`
  display: flex;

  button {
    display: flex;
    align-items: center;
  }
`;

const MuteAllCallsBtn = styled(PrimaryButton)`
  background: rgba(50, 56, 59, 1);
  color: #6fd84f;
  border: 0.2rem solid #6d6d6d;
  min-width: 15rem;
  &.mute {
    svg {
      fill: #f96c6c;
    }
  }

  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;

  svg {
    fill: #6fd84f;
    width: 3rem;
  }
`;

const SavePresetBtn = styled(SecondaryButton)`
  background: transparent;
  border: 0.2rem solid rgba(89, 203, 232, 1);
  color: rgba(89, 203, 232, 1);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(89, 203, 232, 0.1);
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

type HeaderActionsProps = {
  isEmpty: boolean;
  isSingleCall: boolean;
  isMasterInputMuted: boolean;
  addCallActive: boolean;
  callIndexMap: React.MutableRefObject<Record<number, string>>;
  callActionHandlers: React.MutableRefObject<
    Record<string, Record<string, () => void>>
  >;
  setIsMasterInputMuted: React.Dispatch<React.SetStateAction<boolean>>;
  setAddCallActive: (addCallActive: boolean) => void;
  setIsSettingGlobalMute: React.Dispatch<React.SetStateAction<boolean>>;
  sendCallsStateUpdate: () => void;
  resetLastSentCallsState: () => void;
  autoCompanionUrl?: string;
  onCompanionUrlChange?: (url: string | undefined) => void;
  orderedPresetCalls?: {
    productionId: string;
    lineId: string;
    lineUsedForProgramOutput?: boolean;
    isProgramUser?: boolean;
    lineName?: string;
  }[];
};
export const HeaderActions = ({
  isEmpty,
  isSingleCall,
  isMasterInputMuted,
  setIsMasterInputMuted,
  callIndexMap,
  callActionHandlers,
  addCallActive,
  setAddCallActive,
  setIsSettingGlobalMute,
  sendCallsStateUpdate,
  resetLastSentCallsState,
  autoCompanionUrl,
  onCompanionUrlChange,
  orderedPresetCalls,
}: HeaderActionsProps) => {
  const [{ websocket }] = useGlobalState();
  const { handleToggleGlobalMute } = useGlobalMuteToggle({
    setIsMasterInputMuted,
    setIsSettingGlobalMute,
  });
  const [showPresetModal, setShowPresetModal] = useState(false);

  const activeCompanionUrl =
    autoCompanionUrl ??
    (websocket?.readyState === WebSocket.OPEN ? websocket.url : undefined);

  return (
    <>
      <HeaderButtons>
        {!isEmpty && !isSingleCall && !isMobile && (
          <MuteAllCallsBtn
            type="button"
            onClick={handleToggleGlobalMute}
            className={isMasterInputMuted ? "mute" : ""}
          >
            {isMasterInputMuted ? "Unmute All" : "Mute All"}
            {isMasterInputMuted ? <MicMuted /> : <MicUnmuted />}
          </MuteAllCallsBtn>
        )}
        {!isEmpty && !isMobile && !isTablet && (
          <ConnectToWSButton
            callActionHandlers={callActionHandlers}
            callIndexMap={callIndexMap}
            isMasterInputMuted={isMasterInputMuted}
            sendCallsStateUpdate={sendCallsStateUpdate}
            resetLastSentCallsState={resetLastSentCallsState}
            handleToggleGlobalMute={handleToggleGlobalMute}
            autoCompanionUrl={autoCompanionUrl}
            onCompanionUrlChange={onCompanionUrlChange}
          />
        )}
        {!isEmpty && (
          <SavePresetBtn type="button" onClick={() => setShowPresetModal(true)}>
            {isMobile ? "Save" : "Save as Configuration"}
          </SavePresetBtn>
        )}
        {!isEmpty && (
          <AddCallContainer>
            <SecondaryButton
              type="button"
              onClick={() => setAddCallActive(!addCallActive)}
            >
              Add Line
            </SecondaryButton>
          </AddCallContainer>
        )}
      </HeaderButtons>
      {showPresetModal && (
        <SavePresetModal
          companionUrl={activeCompanionUrl}
          orderedPresetCalls={orderedPresetCalls}
          onClose={() => setShowPresetModal(false)}
        />
      )}
    </>
  );
};

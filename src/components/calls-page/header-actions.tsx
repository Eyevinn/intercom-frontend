import styled from "@emotion/styled";
import { MicMuted, MicUnmuted } from "../../assets/icons/icon";
import { isMobile, isTablet } from "../../bowser";
import { PrimaryButton, SecondaryButton } from "../form-elements/form-elements";
import { ConnectToWSButton } from "./connect-to-ws-button";
import { useGlobalMuteToggle } from "./use-global-mute-toggle";

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
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;

  svg {
    fill: #6fd84f;
    width: 3rem;
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
}: HeaderActionsProps) => {
  const { handleToggleGlobalMute } = useGlobalMuteToggle({
    setIsMasterInputMuted,
    setIsSettingGlobalMute,
  });

  return (
    <HeaderButtons>
      {!isEmpty && !isMobile && !isTablet && (
        <ConnectToWSButton
          callActionHandlers={callActionHandlers}
          callIndexMap={callIndexMap}
          isMasterInputMuted={isMasterInputMuted}
          sendCallsStateUpdate={sendCallsStateUpdate}
          resetLastSentCallsState={resetLastSentCallsState}
          handleToggleGlobalMute={handleToggleGlobalMute}
        />
      )}
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
      {!isEmpty && (
        <AddCallContainer>
          <SecondaryButton
            type="button"
            onClick={() => setAddCallActive(!addCallActive)}
          >
            Add Call
          </SecondaryButton>
        </AddCallContainer>
      )}
    </HeaderButtons>
  );
};

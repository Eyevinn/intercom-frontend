import styled from "@emotion/styled";
import { MicMuted, MicUnmuted } from "../../assets/icons/icon";
import { PrimaryButton, SecondaryButton } from "../landing-page/form-elements";
import { isMobile } from "../../bowser";

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
  &.mute {
    svg {
      fill: #f96c6c;
    }
  }

  padding: 1rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  color: white;

  svg {
    fill: #6fd84f;
    width: 3rem;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
`;

type HeaderActionsProps = {
  isEmpty: boolean;
  isSingleCall: boolean;
  isMasterInputMuted: boolean;
  setIsMasterInputMuted: (isMasterInputMuted: boolean) => void;
  addCallActive: boolean;
  setAddCallActive: (addCallActive: boolean) => void;
};
export const HeaderActions = ({
  isEmpty,
  isSingleCall,
  isMasterInputMuted,
  setIsMasterInputMuted,
  addCallActive,
  setAddCallActive,
}: HeaderActionsProps) => {
  return (
    <HeaderButtons>
      {!isEmpty && !isSingleCall && !isMobile && (
        <MuteAllCallsBtn
          type="button"
          onClick={() => setIsMasterInputMuted(!isMasterInputMuted)}
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

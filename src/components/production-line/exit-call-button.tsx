import styled from "@emotion/styled";
import { LogoutIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../form-elements/form-elements";

export const FooterButton = styled(PrimaryButton)`
  margin-top: 1rem;
  background: rgba(50, 56, 59, 1);
  color: white;
  border: 0.2rem solid #6d6d6d;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;

  svg {
    width: 2.5rem;
    height: 2.5rem;
    fill: rgb(89, 203, 232);
  }

  &.hotkeys-button {
    svg {
      fill: #c4c4c4;
    }
  }

  &.whip-button {
    svg {
      fill: #b589fe;
    }
  }

  &.exit-call-button {
    svg {
      fill: #f96c6c;
    }
  }
`;

const ButtonText = styled.div`
  line-height: 2.4rem;
`;

export const ExitCallButton = ({
  resetOnExit,
}: {
  resetOnExit: () => void;
}) => {
  return (
    <FooterButton
      className="exit-call-button"
      type="button"
      title="Exit call"
      onClick={() => resetOnExit()}
    >
      <ButtonText>Leave Call</ButtonText>
      <LogoutIcon />
    </FooterButton>
  );
};

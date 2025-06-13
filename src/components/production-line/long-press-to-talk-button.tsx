import styled from "@emotion/styled";
import { isMobile } from "../../bowser";
import { PrimaryButton } from "../form-elements/form-elements";

type TLongPressToTalkButton = {
  isTalking: boolean;
  onStartTalking?: () => void;
  onStopTalking?: () => void;
};

const Button = styled(PrimaryButton)`
  background: rgba(50, 56, 59, 1);
  color: white;
  border: 0.2rem solid #6d6d6d;
  position: relative;
  width: 100%;

  &.active-btn {
    color: rgba(255, 255, 255, 0);
    animation: pulse 0.7s ease-in-out infinite alternate;
  }

  &.mobile {
    user-select: none;
  }

  @keyframes pulse {
    0% {
      background: #4ada1e;
    }
    100% {
      background: rgba(255, 255, 255, 0.78);
    }
  }
`;

export const LongPressToTalkButton = ({
  isTalking,
  onStartTalking,
  onStopTalking,
}: TLongPressToTalkButton) => {
  return (
    <Button
      className={`${isMobile ? "mobile" : ""} ${isTalking ? "active-btn" : ""}`}
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onStartTalking?.();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onStopTalking?.();
      }}
    >
      <span
        style={{
          textAlign: "center",
          width: "100%",
        }}
      >
        Push To Talk
      </span>
    </Button>
  );
};

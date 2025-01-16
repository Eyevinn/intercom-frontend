import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { PrimaryButton } from "../landing-page/form-elements";
import { isMobile } from "../../bowser";

type TLongPressToTalkButton = {
  muteInput: (input: boolean) => void;
  text?: string;
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
  muteInput,
  text = "Push To Talk",
}: TLongPressToTalkButton) => {
  const [isToggled, setIsToggled] = useState(false);
  const [longPressTimeout, setLongPressTimeout] =
    useState<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }
    };
  }, [longPressTimeout]);

  const toggleMuteAfterTimeout = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    let timeoutId: NodeJS.Timeout;

    switch (e.type) {
      case "pointerdown":
        timeoutId = setTimeout(() => {
          muteInput(false);
          setIsToggled(true);
        }, 300);
        setLongPressTimeout(timeoutId);
        break;
      case "pointerup":
        setIsToggled(false);
        muteInput(true);
        clearTimeout(longPressTimeout);
        break;
      default:
        console.error(`Invalid event type received: ${e.type}`);
    }
  };

  return (
    <Button
      className={`${isMobile ? "mobile" : ""} ${isToggled ? "active-btn" : ""}`}
      type="button"
      onPointerDown={(e) => {
        toggleMuteAfterTimeout(e);
      }}
      onPointerUp={(e) => {
        toggleMuteAfterTimeout(e);
      }}
    >
      <span
        style={{
          textAlign: "center",
          width: "100%",
        }}
      >
        {text}
      </span>
    </Button>
  );
};

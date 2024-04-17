import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { ActionButton } from "../landing-page/form-elements";
import { PulseLoader } from "../loader/loader";
import { isMobile } from "../../bowser";

type TLongPressToTalkButton = {
  micMute: boolean;
  setMicMute: (input: boolean) => void;
};

const Button = styled(ActionButton)`
  position: relative;

  &:active {
    color: rgba(255, 255, 255, 0);
  }

  &.mobile {
    user-select: none;
  }
`;

export const LongPressToTalkButton = ({
  micMute,
  setMicMute,
}: TLongPressToTalkButton) => {
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
          setMicMute(false);
        }, 600);
        setLongPressTimeout(timeoutId);
        break;
      case "pointerup":
        setMicMute(true);
        clearTimeout(longPressTimeout);
        break;
      default:
        console.error(`Invalid event type received: ${e.type}`);
    }
  };

  return (
    <Button
      className={isMobile ? "mobile" : ""}
      type="button"
      onPointerDown={(e) => {
        toggleMuteAfterTimeout(e);
      }}
      onPointerUp={(e) => {
        toggleMuteAfterTimeout(e);
      }}
    >
      Press to Talk
      {!micMute && <PulseLoader />}
    </Button>
  );
};

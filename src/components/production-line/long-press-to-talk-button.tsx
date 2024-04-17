import { useEffect, useState } from "react";
import { ActionButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";

type TLongPressToTalkButton = {
  micMute: boolean;
  setMicMute: (input: boolean) => void;
};

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
        }, 800);
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
    <ActionButton
      className={!micMute ? "submit" : ""}
      type="button"
      onPointerDown={(e) => {
        toggleMuteAfterTimeout(e);
      }}
      onPointerUp={(e) => {
        toggleMuteAfterTimeout(e);
      }}
    >
      Press to Talk
      {!micMute && <Spinner className="push-to-talk" />}
    </ActionButton>
  );
};

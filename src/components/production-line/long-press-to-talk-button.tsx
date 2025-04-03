import styled from "@emotion/styled";
import { useEffect } from "react";
import { isMobile } from "../../bowser";
import { usePushToTalk } from "../../hooks/use-push-to-talk";
import { PrimaryButton } from "../landing-page/form-elements";

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
  const { isTalking, handleLongPressStart, handleLongPressEnd } = usePushToTalk(
    { muteInput }
  );

  useEffect(() => {
    console.log("isTalking", isTalking);
  }, [isTalking]);

  return (
    <Button
      className={`${isMobile ? "mobile" : ""} ${isTalking ? "active-btn" : ""}`}
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLongPressStart();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLongPressEnd();
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

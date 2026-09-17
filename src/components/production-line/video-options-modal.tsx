import styled from "@emotion/styled";

type VideoOptionsDialogueProps = {
  isPinned?: boolean;
  isWhepSource?: boolean;
  onPin: () => void;
  onSelectAsWhep?: () => void;
};

const VideoOptsDialogue = styled.div`
  background-color: #2b2c2e;
  padding: 0.5rem;
  min-width: 10rem;
  border-radius: 0.8rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0.4rem 1.6rem rgba(0, 0, 0, 0.5);
  border: 0.1rem solid rgba(255, 255, 255, 0.08);
`;

const OptionButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-radius: 0.4rem;
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

export const VideoOptionsDialogue = ({
  isPinned,
  isWhepSource,
  onPin,
  onSelectAsWhep,
}: VideoOptionsDialogueProps) => {
  return (
    <VideoOptsDialogue>
      <OptionButton onClick={onPin}>
        {isPinned ? "Unpin video" : "Pin video"}
      </OptionButton>
      {onSelectAsWhep && (
        <OptionButton onClick={onSelectAsWhep}>
          {isWhepSource ? "Unset as WHEP" : "Set as WHEP"}
        </OptionButton>
      )}
    </VideoOptsDialogue>
  );
};

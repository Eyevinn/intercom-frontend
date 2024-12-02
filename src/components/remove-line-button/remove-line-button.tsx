import styled from "@emotion/styled";
import { RemoveIcon } from "../../assets/icons/icon.tsx";

const RemoveLineBtn = styled.button`
  cursor: pointer;
  background: transparent;
  border: transparent;
  position: ${({ isCreatingLine }: { isCreatingLine?: boolean }) =>
    isCreatingLine ? "absolute" : "relative"};
`;

const ButtonIcon = styled.div`
  width: 2.5rem;
`;

export const RemoveLineButton = ({
  removeLine,
  isCreatingLine,
}: {
  removeLine: () => void;
  isCreatingLine?: boolean;
}) => {
  return (
    <RemoveLineBtn
      isCreatingLine={isCreatingLine}
      type="button"
      onClick={() => removeLine()}
    >
      <ButtonIcon>
        <RemoveIcon />
      </ButtonIcon>
    </RemoveLineBtn>
  );
};

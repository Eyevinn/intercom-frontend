import styled from "@emotion/styled";
import { RemoveIcon } from "../../assets/icons/icon.tsx";

const RemoveLineBtn = styled.button`
  cursor: pointer;
  background: transparent;
  border: transparent;
  position: ${({ isCreatingLine }: { isCreatingLine?: boolean }) =>
    isCreatingLine ? "absolute" : "relative"};

  svg {
    width: 2.5rem;
    fill: #f96c6c;
  }
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
      <RemoveIcon />
    </RemoveLineBtn>
  );
};

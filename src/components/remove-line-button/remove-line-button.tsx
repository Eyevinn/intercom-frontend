import styled from "@emotion/styled";
import { RemoveIcon } from "../../assets/icons/icon.tsx";

const RemoveLineBtn = styled.button`
  cursor: pointer;
  background: transparent;
  border: transparent;
  position: relative;
  padding: 0;
  flex-shrink: 0;

  svg {
    width: 2.5rem;
    fill: #f96c6c;
  }
`;

export const RemoveLineButton = ({
  removeLine,
}: {
  removeLine: () => void;
}) => {
  return (
    <RemoveLineBtn type="button" onClick={() => removeLine()}>
      <RemoveIcon />
    </RemoveLineBtn>
  );
};

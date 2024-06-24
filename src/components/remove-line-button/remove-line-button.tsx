import styled from "@emotion/styled";
import { RemoveIcon } from "../../assets/icons/icon.tsx";

const RemoveLineBtn = styled.button`
  cursor: pointer;
  position: absolute;
  top: -0.7rem;
  right: -0.5rem;
  padding: 1rem;
  background: transparent;
  border: transparent;
`;

const ButtonIcon = styled.div`
  width: 2.5rem;
`;

export const RemoveLineButton = ({
  removeLine,
}: {
  removeLine: () => void;
}) => {
  return (
    <RemoveLineBtn type="button" onClick={() => removeLine()}>
      <ButtonIcon>
        <RemoveIcon />
      </ButtonIcon>
    </RemoveLineBtn>
  );
};

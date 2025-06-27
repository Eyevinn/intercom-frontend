import styled from "@emotion/styled";
import { PrimaryButton } from "./form-elements/form-elements";

const borderRadius = 0.5;

const DisplayBox = styled.div`
  border: ${borderRadius}rem solid #424242;
  border-radius: 0.5rem;
  max-width: 50rem;
  margin: 0 1rem;
`;

const DisplayBoxTitle = styled.div`
  background: #424242;
  padding: 1rem;
  padding-top: ${1 - borderRadius}rem;
  color: white;
  font-size: 2rem;
  font-weight: bold;
`;

const DisplayBoxText = styled.div`
  padding: 1rem;

  p {
    font-size: 1.6rem;
    line-height: 1.4;
    padding: 0 0 1rem;
  }
`;

const DisplayBoxButton = styled(PrimaryButton)`
  font-size: 1.4rem;
  line-height: 1.4;
  margin: 0 1rem 1rem;
`;

type TDisplayWarning = {
  text: string | JSX.Element;
  title?: string;
  btn?: () => void;
};

export const DisplayWarning = ({ text, title, btn }: TDisplayWarning) => {
  return (
    <DisplayBox>
      {title && <DisplayBoxTitle>{title}</DisplayBoxTitle>}
      <DisplayBoxText>{text}</DisplayBoxText>
      {btn && (
        <DisplayBoxButton type="button" onClick={btn}>
          Continue Anyway
        </DisplayBoxButton>
      )}
    </DisplayBox>
  );
};

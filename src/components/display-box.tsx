import styled from "@emotion/styled";
import { PrimaryButton } from "./landing-page/form-elements";

const DisplayBox = styled.div`
  border: 5px solid #424242;
  border-radius: 0.5rem;
  max-width: 50rem;
`;

const DisplayBoxTitle = styled.div`
  background: #424242;
  padding: 1rem;
  color: white;
  font-size: 2rem;
  font-weight: bold;
`;

const DisplayBoxText = styled.div`
  font-size: 1.6rem;
  line-height: 1.6;
  padding: 1rem;
`;

const DisplayBoxButton = styled(PrimaryButton)`
  font-size: 1.4rem;
  line-height: 1.4;
  padding: 0.7rem;
  margin: 1rem;
`;

type TDisplayWarning = { text: string; title?: string; btn?: () => void };

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

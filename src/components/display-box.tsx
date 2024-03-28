import styled from "@emotion/styled";

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

type TDisplayWarning = { text: string; title?: string };

export const DisplayWarning = ({ text, title }: TDisplayWarning) => {
  return (
    <DisplayBox>
      {title && <DisplayBoxTitle>{title}</DisplayBoxTitle>}
      <DisplayBoxText>{text}</DisplayBoxText>
    </DisplayBox>
  );
};

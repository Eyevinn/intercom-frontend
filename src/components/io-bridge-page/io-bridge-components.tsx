import styled from "@emotion/styled";
import { PrimaryButton } from "../form-elements/form-elements";

export const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 1rem;
`;

export const HeaderText = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-right: 0.5rem;

  .production-name-container {
    display: inline-block;
    width: 100%;
  }
`;

export const Text = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1rem;
  font-weight: bold;
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 3.2rem;
`;

export const Wrapper = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
`;

export const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  align-items: flex-start;
`;

export const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 40rem;
`;

export const StatusIndicator = styled.div<{ bgColor: string }>`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: ${({ bgColor }) => bgColor};
  margin-right: 1rem;
`;

export const SubmitButton = styled(PrimaryButton)<{
  shouldSubmitOnEnter?: boolean;
}>`
  outline: ${({ shouldSubmitOnEnter }) =>
    shouldSubmitOnEnter ? "2px solid #007bff" : "none"};
  outline-offset: ${({ shouldSubmitOnEnter }) =>
    shouldSubmitOnEnter ? "2px" : "0"};
`;

export const StateChangeButton = styled(PrimaryButton)<{ bgColor: string }>`
  color: white;
  background-color: ${({ bgColor }) => bgColor};
`;

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

export const ButtonContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const IconWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    height: 3rem;
    width: 3rem;
    fill: white;
  }
`;

export const BoldHeader = styled.p`
  font-weight: bold;
  font-size: 2rem;
  margin-bottom: 2rem;
`;

export const BoldText = styled.p`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

export const Collapsible = styled.div<{ open: boolean }>`
  display: grid;
  grid-template-rows: ${(p) => (p.open ? "1fr" : "0fr")};
  transition:
    grid-template-rows 220ms ease,
    opacity 220ms ease,
    margin-top 220ms ease;
  opacity: ${(p) => (p.open ? 1 : 0)};
  margin-top: ${(p) => (p.open ? "16px" : "0")};
  > div {
    overflow: hidden;
  }
`;

export const FieldHeader = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
`;

export const SectionBox = styled.div`
  border: 1px solid #424242;
  border-radius: 0.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  background-color: transparent;
`;

export const SectionHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  color: #fff;
`;

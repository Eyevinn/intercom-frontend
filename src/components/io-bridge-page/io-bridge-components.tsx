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

export const StatusPill = styled.span<{ bgColor: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  background-color: ${({ bgColor }) =>
    `color-mix(in srgb, ${bgColor} 22%, transparent)`};
  color: ${({ bgColor }) => bgColor};
  font-weight: 600;
  font-size: 1.3rem;
  line-height: 1;
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
  font-size: 1.3rem;
  padding: 0.6rem 1.2rem;
  line-height: 1.8rem;
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

export const ButtonContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  p {
    margin: 0;
  }
`;

export const IconWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    height: 1.8rem;
    width: 1.8rem;
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

export const RegularText = styled.span`
  font-weight: normal;
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

export const TransmitterContainer = styled.div`
  padding: 2rem;
`;

export const PropsCard = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 1.6rem;
  row-gap: 0.6rem;
  align-items: baseline;
  margin-top: 1.2rem;
  font-size: 1.3rem;
  line-height: 1.5;
  padding: 1.6rem;
  border-radius: 0.6rem;
  background-color: rgba(255, 255, 255, 0.05);
  margin-bottom: 1rem;
  width: 100%;
`;

export const PropKey = styled.span`
  font-weight: bold;
`;

export const PropValue = styled.span`
  word-break: break-all;
`;

export const EditableValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  word-break: break-all;
`;

export const IconEditButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: #59cbe8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;

  svg {
    width: 1.4rem;
    height: 1.4rem;
    fill: #59cbe8;
  }
`;

export const InlineToggleButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: #59cbe8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 500;

  &:hover {
    color: #7ad6ee;
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
    fill: #59cbe8;
  }
`;

export const InlineCopyButton = styled.button<{ copied?: boolean }>`
  background: none;
  border: none;
  padding: 0;
  color: ${({ copied }) => (copied ? "#22c55e" : "#59cbe8")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.3rem;
  font-weight: 500;
  transition: color 0.2s ease;

  svg {
    width: 1.4rem;
    height: 1.4rem;
    fill: ${({ copied }) => (copied ? "#22c55e" : "#59cbe8")};
    transition:
      fill 0.2s ease,
      transform 0.2s ease;
    transform: ${({ copied }) => (copied ? "scale(1.15)" : "scale(1)")};
  }
`;

export const EditButton = styled.button`
  background: none;
  border: none;
  border-radius: 0.4rem;
  padding: 0.6rem 0.8rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 0.12rem;
`;

export const SaveButton = styled.button<{ updateLoading: boolean }>`
  background: #22c55e;
  border: none;
  border-radius: 0.4rem;
  padding: 0.6rem 0.8rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: ${({ updateLoading }) => (updateLoading ? "not-allowed" : "pointer")};
`;

export const CancelButton = styled.button`
  background: #f96c6c;
  border: none;
  border-radius: 0.4rem;
  padding: 0.6rem 0.8rem;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
`;

export const ExpandedContentIconWrapper = styled.span`
  width: 1.6rem;
  height: 1.6rem;
  display: flex;
  align-items: center;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.2rem;
`;

export const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

export const HeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;

  p {
    margin: 0;
  }
`;

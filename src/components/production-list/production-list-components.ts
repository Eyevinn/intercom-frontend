import styled from "@emotion/styled";
import { isMobile } from "../../bowser";
import { PrimaryButton, SecondaryButton } from "../landing-page/form-elements";
import { mediaQueries } from "../generic-components";

export const ProductionItemWrapper = styled.div`
  text-align: start;
  color: #ffffff;
  background-color: transparent;
  flex: 0 0 calc(25% - 2rem);
  ${isMobile ? `flex-grow: 1;` : `flex-grow: 0;`}
  justify-content: start;
  min-width: 30rem;
  border: 1px solid #424242;
  border-radius: 0.5rem;
  margin: 0 2rem 2rem 0;
  cursor: pointer;

  ${mediaQueries.isLargeScreen} {
    flex: 0 0 calc(33.333% - 2rem);
  }

  ${mediaQueries.isMediumScreen} {
    flex: 0 0 calc(50% - 2rem);
  }

  ${mediaQueries.isSmallScreen} {
    flex: 0 0 calc(100%);
  }
`;

export const ProductionName = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  margin-right: 1rem;
  max-width: 30rem;
  min-width: 20rem;

  .production-name-container {
    display: inline-block;
    width: 100%;
  }
`;

export const ParticipantCountWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.1rem;
`;

export const ParticipantCount = styled.div`
  font-size: 1.5rem;
  color: #9e9e9e;
`;

export const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

export const HeaderTexts = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: ${({
    open,
    isProgramOutputLine,
  }: {
    open: boolean;
    isProgramOutputLine: boolean;
  }) => (!open && isProgramOutputLine ? "1.5rem" : "0")};

  svg {
    height: 1.5rem;
    width: 1.5rem;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
  &.active {
    svg {
      fill: #73d16d;
    }
  }
`;

export const HeaderIcon = styled.div`
  display: flex;
  align-items: center;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
`;

export const ProductionLines = styled.div`
  display: grid;
  padding: 0 2rem;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease-out;

  &.expanded {
    grid-template-rows: 1fr;
    padding-bottom: 2rem;
  }
`;

export const InnerDiv = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const Lineblock = styled.div`
  margin-top: 1rem;
  background-color: ${({ isProgramOutput }: { isProgramOutput?: boolean }) =>
    isProgramOutput ? "rgb(73, 67, 124)" : "rgb(77, 77, 77)"};
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

export const LineBlockTexts = styled.div``;

export const LineBlockTitle = styled.div`
  font-weight: bold;
  font-size: 1.5rem;
`;

export const LineBlockTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ParticipantExpandBtn = styled.button`
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: #a6a6a6;

  &:hover {
    text-decoration: underline;
  }

  svg {
    fill: #a6a6a6;
    width: 2rem;
    margin-top: 0.3rem;
    flex-shrink: 0;
  }
`;

export const LineBlockParticipants = styled.div``;

export const LineBlockParticipant = styled.div`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;

  svg {
    fill: #d6d3d1;
    height: 2rem;
    width: 2rem;
    flex-shrink: 0;
  }
`;

export const PersonText = styled.div`
  margin-left: 0.5rem;
`;

export const DeleteButton = styled(SecondaryButton)`
  display: flex;
  align-items: center;
  background: #d15c5c;
  color: white;

  &:disabled {
    background: #ab5252;
  }
`;

export const ManageButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 1rem 0 1rem 0;
`;

export const AddLineSectionForm = styled.form`
  margin-top: 1rem;
  border: 1px grey solid;
  border-radius: 5px;
  padding: 1rem;
  position: relative;
`;

export const CreateLineButton = styled(PrimaryButton)`
  float: right;
`;

export const AddLineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const RemoveIconWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  &:hover {
    cursor: pointer;
  }
`;

export const SpinnerWrapper = styled.div`
  position: relative;
  width: 2rem;
  height: 2rem;
`;

export const IconWrapper = styled.div`
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    height: 100%;
    width: 100%;
  }
`;

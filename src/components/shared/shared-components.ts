import styled from "@emotion/styled";
import { mediaQueries } from "../generic-components";
import { isMobile } from "../../bowser";

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
  min-width: 0;
  overflow: hidden;
  margin-left: ${({
    open,
    isProgramOutputLine,
  }: {
    open: boolean;
    isProgramOutputLine: boolean;
  }) => (!open && isProgramOutputLine ? "1.5rem" : "0")};
`;

export const HeaderIcon = styled.div`
  display: flex;
  align-items: center;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;

  svg {
    transform: translateY(1.5px);
  }
`;

export const CollapsibleItemWrapper = styled.div`
  text-align: start;
  color: #ffffff;
  background-color: transparent;
  flex: 0 0 calc(25% - 2rem);
  ${isMobile ? `flex-grow: 1;` : `flex-grow: 0;`}
  justify-content: start;
  min-width: 34rem;
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

export const ExpandableSection = styled.div`
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
  position: relative;
`;

export const EditNameIconWrapper = styled.div`
  width: 1.8rem;
  height: 1.8rem;
`;

export const NameEditButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  display: flex;
  justify-content: flex-start;
  align-self: flex-start;
  flex-shrink: 0;
  height: 2rem;
  width: 2rem;

  &.edit {
    margin-top: 0;
  }

  &.save {
    justify-content: center;
    align-self: center;
  }

  svg {
    width: 100%;
    height: 100%;
  }

  &:hover svg {
    transform: scale(1.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:disabled:hover svg {
    transform: none;
  }
`;

export const EditNameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  max-width: 30rem;
  min-height: 2rem;
  pointer-events: none;
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;

  &.ingests {
    background-color: #484848;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    margin: 0 1rem 2rem 1rem;
  }

  > * {
    pointer-events: auto;
  }
`;

import styled from "@emotion/styled";
import { JoinProduction } from "./join-production.tsx";
import { CreateProduction } from "./create-production.tsx";
import { ProductionsList } from "./productions-list.tsx";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";
import { FlexContainer } from "../generic-components.ts";

const DisplayContainer = styled.div`
  flex-basis: 100%;
  display: flex;

  &:first-of-type {
    border-right: 1px solid #424242;
    padding: 5rem 2rem 5rem 5rem;
    justify-content: flex-end;
  }
  &:last-of-type {
    padding: 5rem 5rem 5rem 2rem;
  }
`;

export const LandingPage = () => {
  // TODO does this trigger, or is listening to a state update needed here
  useNavigateToProduction();

  return (
    <>
      <FlexContainer>
        <DisplayContainer>
          <JoinProduction />
        </DisplayContainer>
        <DisplayContainer>
          <CreateProduction />
        </DisplayContainer>
      </FlexContainer>
      <ProductionsList />
    </>
  );
};

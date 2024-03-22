import styled from "@emotion/styled";
import { Header } from "./header.tsx";
import { JoinProduction } from "./join-production.tsx";
import { CreateProduction } from "./create-production.tsx";
import { ProductionsList } from "./productions-list.tsx";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";

const FlexContainer = styled.div`
  display: flex;
`;

const DisplayContainer = styled.div`
  flex-basis: 100%;
  display: flex;

  &:first-of-type {
    border-right: 1px solid white;
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
      <Header />
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

import { JoinProduction } from "./join-production.tsx";
import { CreateProduction } from "./create-production.tsx";
import { ProductionsListContainer } from "./productions-list-container.tsx";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";
import { DisplayContainer, FlexContainer } from "../generic-components.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { isMobile } from "../../bowser.ts";

export const LandingPage = () => {
  const [{ joinProductionOptions }] = useGlobalState();

  useNavigateToProduction(joinProductionOptions);

  return (
    <>
      <FlexContainer>
        <DisplayContainer>
          <JoinProduction />
        </DisplayContainer>
        {!isMobile && (
          <DisplayContainer>
            <CreateProduction />
          </DisplayContainer>
        )}
      </FlexContainer>
      <ProductionsListContainer />
    </>
  );
};

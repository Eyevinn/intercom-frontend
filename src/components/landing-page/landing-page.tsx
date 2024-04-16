import { useNavigate } from "react-router-dom";
import { JoinProduction } from "./join-production.tsx";
import { CreateProduction } from "./create-production.tsx";
import { ProductionsList } from "./productions-list.tsx";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";
import { DisplayContainer, FlexContainer } from "../generic-components.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { ActionButton } from "./form-elements.tsx";
import { isMobile } from "../../bowser.ts";

export const LandingPage = () => {
  const [{ joinProductionOptions }] = useGlobalState();
  const navigate = useNavigate();

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
      <ProductionsList />
      <ActionButton
        type="button"
        onClick={() => navigate("/manage-productions")}
      >
        Manage Productions
      </ActionButton>
    </>
  );
};

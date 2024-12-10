import { useEffect } from "react";
import { JoinProduction } from "./join-production.tsx";
import { CreateProduction } from "./create-production.tsx";
import { ProductionsListContainer } from "./productions-list-container.tsx";
import { DisplayContainer, FlexContainer } from "../generic-components.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { isMobile } from "../../bowser.ts";

export const LandingPage = ({ setApiError }: { setApiError: () => void }) => {
  const [{ apiError }] = useGlobalState();

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

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

import { useEffect, useState } from "react";
import { JoinProduction } from "./join-production.tsx";
import { CreateProduction } from "./create-production.tsx";
import { ProductionsListContainer } from "./productions-list-container.tsx";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";
import { DisplayContainer, FlexContainer } from "../generic-components.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { isMobile } from "../../bowser.ts";
import { TJoinProductionOptions } from "../production-line/types.ts";

export const LandingPage = ({ setApiError }: { setApiError: () => void }) => {
  const [singleJoinProductionOptions, setSingleJoinProductionOptions] =
    useState<TJoinProductionOptions | null>(null);
  const [{ calls, apiError }] = useGlobalState();

  useEffect(() => {
    Object.entries(calls).forEach(([callId, callState]) => {
      if (callId) {
        setSingleJoinProductionOptions(callState.joinProductionOptions);
      }
    });
  }, [calls]);

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

  useNavigateToProduction(singleJoinProductionOptions);

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

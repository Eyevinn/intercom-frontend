import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled from "@emotion/styled";
import { useState } from "react";
import { ProductionLine } from "./components/production-line/production-line.tsx";
import { ErrorPage } from "./components/router-error.tsx";
import { useDevicePermissions } from "./use-device-permission.ts";
import { LandingPage } from "./components/landing-page/landing-page.tsx";
import { useInitializeGlobalStateReducer } from "./global-state/global-state-reducer.ts";
import { GlobalStateContext } from "./global-state/context-provider.tsx";
import { Header } from "./components/header.tsx";
import { ErrorBanner } from "./components/error";
import { useFetchDevices } from "./use-fetch-devices.ts";
import {
  DisplayContainer,
  FlexContainer,
} from "./components/generic-components.ts";
import { DisplayWarning } from "./components/display-box.tsx";
import { ManageProductions } from "./components/manage-productions/manage-productions.tsx";
import { useCheckForSupportedBrowser } from "./use-check-for-supported-browser.ts";
import { DisplayContainerHeader } from "./components/landing-page/display-container-header.tsx";
import { NavigateToRootButton } from "./components/navigate-to-root-button/navigate-to-root-button.tsx";

const DisplayBoxPositioningContainer = styled(FlexContainer)`
  justify-content: center;
  align-items: center;
  padding-top: 12rem;
`;

const ButtonWrapper = styled.div`
  margin: 0 2rem 2rem;
  display: inline-block;
`;

const NotFound = () => {
  return (
    <DisplayContainer>
      <DisplayContainerHeader>
        <ButtonWrapper>
          <NavigateToRootButton />
        </ButtonWrapper>
        Page not found.
      </DisplayContainerHeader>
    </DisplayContainer>
  );
};

const App = () => {
  const { browserSupported, browserUpdated } = useCheckForSupportedBrowser();
  const { denied, permission } = useDevicePermissions();
  const initializedGlobalState = useInitializeGlobalStateReducer();
  const [, dispatch] = initializedGlobalState;
  const [unsupportedContinue, setUnsupportedContinue] = useState(false);

  const continueToApp =
    (browserSupported && browserUpdated) || unsupportedContinue;

  useFetchDevices({
    dispatch,
    permission,
  });

  return (
    <GlobalStateContext.Provider value={initializedGlobalState}>
      <Header />
      <ErrorBanner />

      {!browserSupported && !unsupportedContinue && (
        <DisplayBoxPositioningContainer>
          <DisplayWarning
            text="To use this application it is recommended to use one of the following browsers: Chrome, Windows Edge, Firefox or Safari."
            title="Browser not supported"
            btn={() => setUnsupportedContinue(true)}
          />
        </DisplayBoxPositioningContainer>
      )}

      {browserSupported && !browserUpdated && !unsupportedContinue && (
        <DisplayBoxPositioningContainer>
          <DisplayWarning
            text="To use this application we recommend using a newer version of your browser, please update and try again."
            title="Browser to old"
            btn={() => setUnsupportedContinue(true)}
          />
        </DisplayBoxPositioningContainer>
      )}
      {continueToApp && (
        <>
          {denied && (
            <DisplayBoxPositioningContainer>
              <DisplayWarning
                text="To use this application it has to be granted access to audio devices. Reload browser and/or reset permissions to try
            again."
                title="Permissions have been denied"
              />
            </DisplayBoxPositioningContainer>
          )}
          {!permission && !denied && (
            <DisplayBoxPositioningContainer>
              <DisplayWarning
                text="To use this application it has to be granted access to audio devices."
                title="Waiting for device permissions"
              />
            </DisplayBoxPositioningContainer>
          )}
          {permission && !denied && (
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={<LandingPage />}
                  errorElement={<ErrorPage />}
                />
                <Route
                  path="/manage-productions"
                  element={<ManageProductions />}
                  errorElement={<ErrorPage />}
                />
                <Route
                  path="/production/:productionId/line/:lineId"
                  element={<ProductionLine />}
                  errorElement={<ErrorPage />}
                />
            <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          )}
        </>
      )}
    </GlobalStateContext.Provider>
  );
};

export default App;

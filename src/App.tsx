import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { ErrorPage } from "./components/router-error.tsx";
import { useDevicePermissions } from "./hooks/use-device-permission.ts";
import { LandingPage } from "./components/landing-page/landing-page.tsx";
import { useInitializeGlobalStateReducer } from "./global-state/global-state-reducer.ts";
import { GlobalStateContext } from "./global-state/context-provider.tsx";
import { ErrorBanner } from "./components/error";
import { useFetchDevices } from "./hooks/use-fetch-devices.ts";
import {
  DisplayContainer,
  FlexContainer,
} from "./components/generic-components.ts";
import { DisplayWarning } from "./components/display-box.tsx";
import { isValidBrowser } from "./bowser.ts";
import { DisplayContainerHeader } from "./components/landing-page/display-container-header.tsx";
import { NavigateToRootButton } from "./components/navigate-to-root-button/navigate-to-root-button.tsx";
import { CallsPage } from "./components/calls-page/calls-page.tsx";
import { Header } from "./components/header.tsx";
import { useLocalUserSettings } from "./hooks/use-local-user-settings.ts";
import { ManageProductionsPage } from "./components/manage-productions-page/manage-productions-page.tsx";
import { CreateProductionPage } from "./components/create-production/create-production-page.tsx";
import { useSetupTokenRefresh } from "./hooks/use-reauth.tsx";
import { TUserSettings } from "./components/user-settings/types";

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

type AppContentProps = {
  continueToApp: boolean;
  denied: boolean;
  permission: boolean;
  apiError: boolean;
  userSettings: TUserSettings | null;
  setUnsupportedContinue: (value: boolean) => void;
  setApiError: (value: boolean) => void;
};

const AppContent = ({
  continueToApp,
  denied,
  permission,
  apiError,
  userSettings,
  setUnsupportedContinue,
  setApiError,
}: AppContentProps) => {
  const { setupTokenRefresh } = useSetupTokenRefresh();

  useEffect(() => {
    const cleanup = setupTokenRefresh();
    return () => cleanup();
  }, [setupTokenRefresh]);

  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Header />
      <ErrorBanner />

      {!isValidBrowser && !continueToApp && (
        <DisplayBoxPositioningContainer>
          <DisplayWarning
            text={
              <>
                <p>
                  To use this application it is recommended to use one of the
                  following browsers: Chrome, Edge, Firefox or Safari.
                </p>
                <p>
                  If you are using one of the recommended browsers, then it is
                  an older version and should be updated before continuing.
                </p>
              </>
            }
            title="Browser not supported"
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
          {apiError && (
            <DisplayBoxPositioningContainer>
              <DisplayWarning
                text="The server is not available. Reload page to try again."
                title="Server not available"
              />
            </DisplayBoxPositioningContainer>
          )}
          {permission && !denied && !apiError && userSettings && (
            <Routes>
              <>
                <Route
                  path="/"
                  element={
                    <LandingPage setApiError={() => setApiError(true)} />
                  }
                  errorElement={<ErrorPage />}
                />
                <Route
                  path="/create-production"
                  element={<CreateProductionPage />}
                  errorElement={<ErrorPage />}
                />
                <Route
                  path="/manage-productions"
                  element={
                    <ManageProductionsPage
                      setApiError={() => setApiError(true)}
                    />
                  }
                  errorElement={<ErrorPage />}
                />
                <Route
                  path="/production-calls/production/:productionId/line/:lineId"
                  element={<CallsPage />}
                  errorElement={<ErrorPage />}
                />
                <Route path="*" element={<NotFound />} />
              </>
            </Routes>
          )}
        </>
      )}
    </BrowserRouter>
  );
};

const App = () => {
  const [unsupportedContinue, setUnsupportedContinue] = useState(false);
  const continueToApp = isValidBrowser || unsupportedContinue;
  const { denied, permission } = useDevicePermissions({ continueToApp });
  const initializedGlobalState = useInitializeGlobalStateReducer();
  const [{ devices, userSettings }, dispatch] = initializedGlobalState;
  const [apiError, setApiError] = useState(false);

  useFetchDevices({
    dispatch,
    permission,
  });

  useLocalUserSettings({ devices, dispatch });

  return (
    <GlobalStateContext.Provider value={initializedGlobalState}>
      <AppContent
        continueToApp={continueToApp}
        denied={denied}
        permission={permission}
        apiError={apiError}
        userSettings={userSettings}
        setUnsupportedContinue={setUnsupportedContinue}
        setApiError={setApiError}
      />
    </GlobalStateContext.Provider>
  );
};

export default App;

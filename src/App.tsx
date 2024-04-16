import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled from "@emotion/styled";
import { ProductionLine } from "./components/production-line/production-line.tsx";
import { ErrorPage } from "./components/router-error.tsx";
import { useDevicePermissions } from "./use-device-permission.ts";
import { LandingPage } from "./components/landing-page/landing-page.tsx";
import { useInitializeGlobalStateReducer } from "./global-state/global-state-reducer.ts";
import { GlobalStateContext } from "./global-state/context-provider.tsx";
import { Header } from "./components/header.tsx";
import { ErrorBanner } from "./components/error";
import { useFetchDevices } from "./use-fetch-devices.ts";
import { FlexContainer } from "./components/generic-components.ts";
import { DisplayWarning } from "./components/display-box.tsx";
import { ManageProductions } from "./components/manage-productions/manage-productions.tsx";

const DisplayBoxPositioningContainer = styled(FlexContainer)`
  justify-content: center;
  align-items: center;
  padding-top: 12rem;
`;

const App = () => {
  const { denied, permission } = useDevicePermissions();
  const initializedGlobalState = useInitializeGlobalStateReducer();
  const [, dispatch] = initializedGlobalState;

  useFetchDevices({
    dispatch,
    permission,
  });

  return (
    <GlobalStateContext.Provider value={initializedGlobalState}>
      <Header />
      <ErrorBanner />

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
          </Routes>
        </BrowserRouter>
      )}
    </GlobalStateContext.Provider>
  );
};

export default App;

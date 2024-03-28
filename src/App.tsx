import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import styled from "@emotion/styled";
import { Production } from "./components/production/production.tsx";
import { ErrorPage } from "./components/router-error.tsx";
import { useDevicePermissions } from "./hooks/device-permission.ts";
import { LandingPage } from "./components/landing-page/landing-page.tsx";
import { useInitializeGlobalStateReducer } from "./global-state/global-state-reducer.ts";
import { GlobalStateContext } from "./global-state/context-provider.tsx";
import { Header } from "./components/landing-page/header.tsx";
import { Error } from "./components/landing-page/error.tsx";
import { useFetchDevices } from "./hooks/fetch-devices.ts";
import { FlexContainer } from "./components/generic-components.ts";
import { DisplayWarning } from "./components/display-box.tsx";

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
      <Error />

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
              path="/production/:productionId/line/:lineId"
              element={<Production />}
              errorElement={<ErrorPage />}
            />
          </Routes>
        </BrowserRouter>
      )}
    </GlobalStateContext.Provider>
  );
};

export default App;

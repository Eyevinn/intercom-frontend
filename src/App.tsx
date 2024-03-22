import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Production } from "./components/production/production.tsx";
import { ErrorPage } from "./components/router-error.tsx";
import { useDevicePermissions } from "./hooks/device-permission.ts";
import { LandingPage } from "./components/landing-page/landing-page.tsx";
import { useInitializeGlobalStateReducer } from "./global-state/global-state-reducer.ts";
import { GlobalStateContext } from "./global-state/context-provider.tsx";
import { Header } from "./components/landing-page/header.tsx";

const App = () => {
  const { denied, permission } = useDevicePermissions();
  const initializedGlobalState = useInitializeGlobalStateReducer();

  return (
    <GlobalStateContext.Provider value={initializedGlobalState}>
      <Header />

      {/* TODO add error element here, e.g. a red banner with text */}

      {denied && (
        <div>
          Permission denied, reload browser and/or reset permissions to try
          again.
        </div>
      )}

      {!permission && <div>Waiting for device permissions</div>}

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

import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Production } from "./components/production/production.tsx";
import { ErrorPage } from "./components/router-error.tsx";
import { useDevicePermissions } from "./hooks/device-permission.ts";
import { LandingPage } from "./components/landing-page/landing-page.tsx";
import { useInitializeGlobalStateReducer } from "./global-state/global-state-reducer.ts";
import { GlobalStateContext } from "./global-state/context-provider.tsx";

const App = () => {
  const { denied, permission } = useDevicePermissions();
  const initializedGlobalState = useInitializeGlobalStateReducer();

  if (denied) {
    return (
      <div>
        Permission denied, reload browser and/or reset permissions to try again.
      </div>
    );
  }

  if (!permission) return <div>Waiting for device permissions</div>;

  return (
    <GlobalStateContext.Provider value={initializedGlobalState}>
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
    </GlobalStateContext.Provider>
  );
};

export default App;

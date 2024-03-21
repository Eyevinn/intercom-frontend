import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Production } from "./components/production.tsx";
import { ErrorPage } from "./components/router-error.tsx";
import { useDevicePermissions } from "./hooks/device-permission.ts";
import { LandingPage } from "./components/landing-page/landing-page.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "production/:productionId",
    // loader: productionLoader,
    element: <Production />,
  },
]);

const App = () => {
  const { denied, permission } = useDevicePermissions();

  if (denied) {
    return (
      <div>
        Permission denied, reload browser and/or reset permissions to try again.
      </div>
    );
  }

  if (!permission) return <div>Waiting for device permissions</div>;

  return <RouterProvider router={router} />;
};

export default App;

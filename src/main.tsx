import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { IntercomAuthProvider } from "./auth/auth-provider.tsx";
import { RequireAuth } from "./auth/require-auth.tsx";
import { ErrorBoundary } from "./components/error-boundary.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <IntercomAuthProvider>
        <RequireAuth>
          <App />
        </RequireAuth>
      </IntercomAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

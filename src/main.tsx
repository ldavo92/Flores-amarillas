import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./lib/i18n";
import "./styles/tokens.css";
import "./styles/tailwind.css";
import App from "./App";
import { useGameStore } from "./store/useGameStore";
import { applyTheme } from "./lib/theme";
import { registerServiceWorker } from "./lib/pwa";

// HashRouter en lugar de BrowserRouter: rutas tipo `/#/hub` que funcionan en
// cualquier host estático (incluyendo GitHub Pages bajo subruta) sin necesidad
// de reescritura del lado del servidor.
const queryClient = new QueryClient();

// Aplica el tema guardado antes del primer render (evita flash).
applyTheme(useGameStore.getState().theme);
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";

const convex = new ConvexReactClient(
  (import.meta.env.VITE_CONVEX_URL as string) || "https://dummy.convex.cloud"
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-card)",
                color: "var(--color-foreground)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </ConvexProvider>
  </React.StrictMode>
);
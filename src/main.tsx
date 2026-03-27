import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./index.css";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </MotionConfig>
  </StrictMode>
);

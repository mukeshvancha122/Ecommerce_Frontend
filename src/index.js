// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store";
import { hydrateFromStorage } from "./features/auth/AuthSlice";

store.dispatch(hydrateFromStorage());

// Global error handler to catch unhandled errors
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  // Prevent default error handling that might block UI
  event.preventDefault();
});

// Global unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  // Prevent default error handling
  event.preventDefault();
});

// Check for stuck modals on page load
const checkForStuckModals = () => {
  const backdrops = document.querySelectorAll("[class*='backdrop'], [class*='overlay'], [class*='modal']");
  backdrops.forEach((backdrop) => {
    const style = window.getComputedStyle(backdrop);
    if (style.display !== "none" && style.pointerEvents === "auto") {
      // Check if modal should be visible
      const isVisible = style.opacity !== "0" && style.visibility !== "hidden";
      if (isVisible) {
        // Check if there's a close button or way to close
        const closeBtn = backdrop.querySelector("[aria-label*='close'], [class*='close'], button");
        if (!closeBtn) {
          console.warn("Potential stuck modal detected:", backdrop);
        }
      }
    }
  });
};

// Run check after a delay to allow React to render
setTimeout(checkForStuckModals, 1000);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

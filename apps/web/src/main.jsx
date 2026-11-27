import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
if (!import.meta.env.VITE_GITHUB_PAGES && !import.meta.env.VITE_DEMO_MODE && "serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {}));
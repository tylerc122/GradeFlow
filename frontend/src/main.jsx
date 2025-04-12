import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";
import "./index.css";
import "./darkmode.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CssBaseline />
    <App />
  </StrictMode>
);

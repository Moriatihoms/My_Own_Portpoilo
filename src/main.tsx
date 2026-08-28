import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SpacePortfolio from "./App";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode><SpacePortfolio /></StrictMode>,
);

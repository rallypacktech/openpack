/* global pendo */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import "leaflet/dist/leaflet.css";

pendo.initialize({ visitor: { id: "" } });

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

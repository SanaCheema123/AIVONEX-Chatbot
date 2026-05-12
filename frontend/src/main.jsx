import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./styles/globals.css"
import { Toaster } from "react-hot-toast"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style:{background:"#1e293b",color:"#f8fafc",border:"1px solid #334155",fontFamily:"Plus Jakarta Sans, sans-serif",fontSize:"12.5px",borderRadius:"10px",padding:"10px 14px"},
        success:{iconTheme:{primary:"#22c55e",secondary:"#1e293b"}},
        error:{iconTheme:{primary:"#ef4444",secondary:"#1e293b"}},
      }}
    />
  </React.StrictMode>
)

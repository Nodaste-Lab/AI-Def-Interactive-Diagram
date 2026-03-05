import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/embed.css";

const root = document.getElementById("root")!;
root.classList.add("nodaste-diagram");
createRoot(root).render(<App />);

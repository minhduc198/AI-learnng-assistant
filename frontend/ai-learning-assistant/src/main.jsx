import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProfileProvider from "./context/ProfileContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ProfileProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <App />
    </ProfileProvider>
  </AuthProvider>,
);

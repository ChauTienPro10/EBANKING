import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import "./i18n";

// Import test utilities for development
if (import.meta.env.DEV) {
  import("./services/testUserService");
  import("./services/testAccountService");
  import("./services/debugAccountAPI");
  import("./services/testAccountWithSampleData");
  import("./services/testAccountSearch");
  import("./services/testAccountFlow");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

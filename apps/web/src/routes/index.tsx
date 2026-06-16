import { createBrowserRouter } from "react-router-dom";

import { appRoutes } from "./app.routes";
import { publicRoutes } from "./public.routes";
import { marketingRoutes } from "./marketing.routes";
import { NotFoundPage } from "../pages";

export const router = createBrowserRouter([
  marketingRoutes,
  appRoutes,
  publicRoutes,
  {
    path: "*",
    element: <NotFoundPage />
  }
]);

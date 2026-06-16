import { Navigate } from "react-router-dom";

import { AppLayout } from "../layouts";
import { DashboardPage, EventsPage, EventDetailPage } from "../pages";

export const appRoutes = {
  path: "/app",
  element: <AppLayout />,
  children: [
    {
      index: true, element: <Navigate to="dashboard" replace />
    },
    {
      path: "dashboard", element: <DashboardPage />
    },
    {
      path: "events",
      element: <EventsPage />
    },
    {
      path: "events/:eventId",
      element: <EventDetailPage />
    }
  ]
}

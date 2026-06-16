import { PublicLayout } from "../layouts";
import { PublicEventPage } from "../pages";

export const publicRoutes = {
  path: "/e",
  element: <PublicLayout />,
  children: [
    {
      path: ":slug",
      element: <PublicEventPage />
    }
  ]
}

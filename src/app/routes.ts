import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Clubs } from "./pages/Clubs";
import { ClubDetail } from "./pages/ClubDetail";
import { Events } from "./pages/Events";
import { Projects } from "./pages/Projects";
import { StudyGroups } from "./pages/StudyGroups";
import { Notifications } from "./pages/Notifications";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "profile", Component: Profile },
      { path: "clubs", Component: Clubs },
      { path: "clubs/:id", Component: ClubDetail },
      { path: "events", Component: Events },
      { path: "projects", Component: Projects },
      { path: "study-groups", Component: StudyGroups },
      { path: "notifications", Component: Notifications },
    ],
  },
]);

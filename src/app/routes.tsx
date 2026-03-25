import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
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
    path: "/login",
<<<<<<< HEAD
    Component: Login,
=======
    element: <Login />,
>>>>>>> 249f7611993147c13c081e1a5d0cf172b5d6e36a
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
<<<<<<< HEAD
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
=======
        element: <Layout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "clubs", element: <Clubs /> },
          { path: "clubs/:id", element: <ClubDetail /> },
          { path: "events", element: <Events /> },
          { path: "projects", element: <Projects /> },
          { path: "study-groups", element: <StudyGroups /> },
          { path: "notifications", element: <Notifications /> },
>>>>>>> 249f7611993147c13c081e1a5d0cf172b5d6e36a
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
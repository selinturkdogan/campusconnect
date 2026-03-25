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
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
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
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
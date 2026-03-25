import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./app/routes";
import { AuthProvider } from "./app/context/AuthContext";
import "./app/styles/index.css";
<<<<<<< HEAD

=======
 
>>>>>>> 249f7611993147c13c081e1a5d0cf172b5d6e36a
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
<<<<<<< HEAD
);
=======
);
 
>>>>>>> 249f7611993147c13c081e1a5d0cf172b5d6e36a

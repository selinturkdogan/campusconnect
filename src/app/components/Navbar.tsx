import { Bell, Search, GraduationCap, LogOut } from "lucide-react";
import { Link } from "react-router";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center px-6 gap-4">
      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-xl text-primary mr-6"
      >
        <GraduationCap className="w-7 h-7" />
        CampusConnect
      </Link>

      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students, clubs, projects..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user?.role === "admin" && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
            Admin
          </span>
        )}

        <Link
          to="/notifications"
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Link>

        <Link to="/profile">
          <Avatar name={user?.name || "User"} size="sm" />
        </Link>

        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
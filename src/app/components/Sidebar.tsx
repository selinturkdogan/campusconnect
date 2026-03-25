import { Home, User, Users, Calendar, Briefcase, BookOpen, Bell } from "lucide-react";
import { Link, useLocation } from "react-router";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Users, label: "Clubs", path: "/clubs" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Briefcase, label: "Projects", path: "/projects" },
  { icon: BookOpen, label: "Study Groups", path: "/study-groups" },
  { icon: Bell, label: "Notifications", path: "/notifications", badge: 4 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-card border-r border-border overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium flex-1">{item.label}</span>
              {"badge" in item && item.badge ? (
                <span className="w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Bell, Briefcase, Calendar, MessageSquare, Users, CheckCheck } from "lucide-react";
import { useState } from "react";

type NotifType = "project" | "club" | "event" | "study" | "system";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const iconMap: Record<NotifType, React.ElementType> = {
  project: Briefcase,
  club: Users,
  event: Calendar,
  study: MessageSquare,
  system: Bell,
};

const colorMap: Record<NotifType, string> = {
  project: "bg-blue-50 text-blue-600",
  club: "bg-green-50 text-green-600",
  event: "bg-orange-50 text-orange-600",
  study: "bg-purple-50 text-purple-600",
  system: "bg-primary/10 text-primary",
};

const typeLabels: Record<NotifType, string> = {
  project: "Project",
  club: "Club",
  event: "Event",
  study: "Study",
  system: "System",
};

export function Notifications() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1, type: "project",
      title: "New application to your project",
      message: "Mehmet Aydın applied for the Frontend Developer role in CampusConnect.",
      time: "2 hours ago", unread: true,
    },
    {
      id: 2, type: "club",
      title: "ACM Student Chapter — New Announcement",
      message: "Hackathon ITU 2025 registration is now open! Limited spots available.",
      time: "4 hours ago", unread: true,
    },
    {
      id: 3, type: "event",
      title: "Event Reminder — AI Research Seminar",
      message: "The AI Research Seminar is tomorrow at 14:00 in EEB-2001.",
      time: "6 hours ago", unread: true,
    },
    {
      id: 4, type: "study",
      title: "New file in Data Structures group",
      message: "Ayşe Tuna uploaded \"Midterm Summary Notes.pdf\" to the group.",
      time: "8 hours ago", unread: true,
    },
    {
      id: 5, type: "project",
      title: "Your application was accepted!",
      message: "Congratulations! You have been accepted to SmartBudget AI as a Backend Developer.",
      time: "Yesterday, 15:32", unread: false,
    },
    {
      id: 6, type: "club",
      title: "Web Dev Society — New Event",
      message: "Monthly frontend challenge posted. Theme: 'Responsive Dashboard Design'.",
      time: "Yesterday, 11:00", unread: false,
    },
    {
      id: 7, type: "event",
      title: "Career Fair 2025 — 1 Day Left",
      message: "Don't forget! Career Fair is tomorrow at 10:00 in the Sports Hall.",
      time: "2 days ago", unread: false,
    },
    {
      id: 8, type: "system",
      title: "Profile analysis complete",
      message: "Your AI profile analysis is ready. Your profile is 78% complete.",
      time: "3 days ago", unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const filtered = filter === "unread" ? notifications.filter((n) => n.unread) : notifications;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function markRead(id: number) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay up to date with everything happening on campus</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "all" ? "primary" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All ({notifications.length})
        </Button>
        <Button variant={filter === "unread" ? "primary" : "outline"} size="sm" onClick={() => setFilter("unread")}>
          Unread ({unreadCount})
        </Button>
      </div>

      <div className="max-w-2xl space-y-3">
        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No notifications</h3>
            <p className="text-muted-foreground text-sm">You are all caught up!</p>
          </Card>
        )}
        {filtered.map((notif) => {
          const Icon = iconMap[notif.type];
          return (
            <Card
              key={notif.id}
              className={`p-4 transition-all hover:shadow-md cursor-pointer ${notif.unread ? "border-primary/20 bg-accent" : ""}`}
              onClick={() => markRead(notif.id)}
            >
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[notif.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {notif.unread && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{notif.title}</h3>
                    <Tag variant="muted" className="text-xs flex-shrink-0">{typeLabels[notif.type]}</Tag>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">{notif.time}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

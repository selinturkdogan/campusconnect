import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Bell, Briefcase, Calendar, MessageSquare, Users, CheckCheck, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api";

type NotifType = "project_application" | "project_application_result" | "project_team_join" |
  "club_announcement" | "club_application_result" | "new_event" | "event_reminder" |
  "study_file_upload" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const iconMap: Record<string, React.ElementType> = {
  project_application: Briefcase,
  project_application_result: Briefcase,
  project_team_join: Briefcase,
  club_announcement: Users,
  club_application_result: Users,
  new_event: Calendar,
  event_reminder: Calendar,
  study_file_upload: MessageSquare,
  system: Bell,
};

const colorMap: Record<string, string> = {
  project_application: "bg-blue-50 text-blue-600",
  project_application_result: "bg-blue-50 text-blue-600",
  project_team_join: "bg-blue-50 text-blue-600",
  club_announcement: "bg-green-50 text-green-600",
  club_application_result: "bg-green-50 text-green-600",
  new_event: "bg-orange-50 text-orange-600",
  event_reminder: "bg-orange-50 text-orange-600",
  study_file_upload: "bg-purple-50 text-purple-600",
  system: "bg-primary/10 text-primary",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/notifications/");
      setNotifications(data);
    } catch {
      console.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }

  async function markRead(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filtered = filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
          const Icon = iconMap[notif.type] || Bell;
          return (
            <Card
              key={notif.id}
              className={`p-4 transition-all hover:shadow-md cursor-pointer ${!notif.is_read ? "border-primary/20 bg-accent" : ""}`}
              onClick={() => { if (!notif.is_read) markRead(notif.id); }}
            >
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[notif.type] || colorMap.system}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {!notif.is_read && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{notif.title}</h3>
                    <Tag variant="muted" className="text-xs flex-shrink-0">{notif.type.split("_")[0]}</Tag>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{notif.body}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

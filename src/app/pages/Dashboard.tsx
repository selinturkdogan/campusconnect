import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Calendar, MapPin, Users, Briefcase, Bell, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  roles_needed: string[];
  status: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

interface Stats {
  activeProjects: number;
  clubsJoined: number;
  eventsRsvpd: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>({ activeProjects: 0, clubsJoined: 0, eventsRsvpd: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setIsLoading(true);
      const [eventsData, projectsData, notificationsData, myApplications, myClubs] = await Promise.all([
        apiFetch("/api/events/"),
        apiFetch("/api/projects/"),
        apiFetch("/api/notifications/"),
        apiFetch("/api/projects/my/applications"),
        apiFetch("/api/clubs/"),
      ]);

      const now = new Date();
      const upcoming = eventsData
        .filter((e: Event) => new Date(e.event_date) > now)
        .slice(0, 3);
      setEvents(upcoming);

      const openProjects = projectsData
        .filter((p: Project) => p.status === "open")
        .slice(0, 2);
      setProjects(openProjects);

      setNotifications(notificationsData.slice(0, 4));

      const acceptedApplications = myApplications.filter(
        (a: { status: string }) => a.status === "accepted"
      ).length;

      const joinedClubs = myClubs.filter(() => true).length;

      setStats({
        activeProjects: acceptedApplications,
        clubsJoined: joinedClubs,
        eventsRsvpd: eventsData.length,
      });
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function markNotificationRead(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-white/90">
          Here's what's happening in your campus community today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold mt-1">{stats.activeProjects}</p>
            </div>
            <Briefcase className="w-10 h-10 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clubs</p>
              <p className="text-2xl font-bold mt-1">{stats.clubsJoined}</p>
            </div>
            <Users className="w-10 h-10 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold mt-1">{stats.eventsRsvpd}</p>
            </div>
            <Calendar className="w-10 h-10 text-secondary" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Open Projects</h2>
              <Link to="/projects">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            {projects.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No open projects yet.</p>
                <Link to="/projects">
                  <Button className="mt-4">Browse Projects</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tech_stack.map((tech) => (
                        <Tag key={tech} variant="primary">{tech}</Tag>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.roles_needed.map((role) => (
                        <Tag key={role} variant="secondary">{role}</Tag>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Link to="/projects">
                        <Button>Apply Now</Button>
                      </Link>
                      <Link to="/projects">
                        <Button variant="outline">Learn More</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Events + Notifications */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <Link to="/events">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            {events.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground text-sm">No upcoming events.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="p-5">
                    <h3 className="font-semibold mb-3">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Link to="/events">
                      <Button className="w-full">RSVP</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground text-sm">No notifications yet.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:shadow-md transition-all ${
                      !notification.is_read ? "bg-accent border-primary/20" : ""
                    }`}
                    onClick={() => { if (!notification.is_read) markNotificationRead(notification.id); }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bell className="w-4 h-4 text-primary" />
                        </div>
                        {!notification.is_read && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{notification.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.created_at)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                <Link to="/notifications">
                  <Button variant="outline" className="w-full mt-2">View all notifications</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
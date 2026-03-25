import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { Calendar, MapPin, Users, Briefcase, TrendingUp, Bell, UserPlus, MessageSquare } from "lucide-react";
import { Link } from "react-router";

export function Dashboard() {
  const suggestedProjects = [
    {
      id: 1,
      title: "AI Study Assistant Web App",
      description: "Build an AI-powered study assistant using React and OpenAI",
      roles: ["Frontend Dev", "UI Designer"],
      techStack: ["React", "TypeScript", "OpenAI API"],
      matchScore: 95,
    },
    {
      id: 2,
      title: "Campus Events Mobile App",
      description: "React Native app for discovering campus events",
      roles: ["Mobile Dev", "Backend Dev"],
      techStack: ["React Native", "Node.js", "MongoDB"],
      matchScore: 88,
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Talk: Web3 & Blockchain",
      date: "Mar 15, 2026",
      time: "6:00 PM",
      location: "Engineering Building, Room 301",
      attendees: 42,
    },
    {
      id: 2,
      title: "Hackathon 2026",
      date: "Mar 20, 2026",
      time: "9:00 AM",
      location: "Student Center",
      attendees: 156,
    },
    {
      id: 3,
      title: "Career Fair",
      date: "Mar 22, 2026",
      time: "10:00 AM",
      location: "Main Hall",
      attendees: 203,
    },
  ];

  const clubAnnouncements = [
    {
      id: 1,
      club: "Computer Science Club",
      announcement: "New workshop series starting next week on React advanced patterns!",
      time: "2 hours ago",
    },
    {
      id: 2,
      club: "Robotics Club",
      announcement: "Competition registration is now open. Team formation meeting this Friday.",
      time: "5 hours ago",
    },
    {
      id: 3,
      club: "Data Science Society",
      announcement: "Guest speaker from Google next Wednesday. Don't miss it!",
      time: "1 day ago",
    },
  ];

  const recentNotifications = [
    {
      id: 1,
      icon: UserPlus,
      title: "New connection request",
      message: "Sarah Chen wants to connect",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      icon: Calendar,
      title: "Event reminder",
      message: "Tech Talk starts in 1 hour",
      time: "3 hours ago",
      unread: true,
    },
    {
      id: 3,
      icon: MessageSquare,
      title: "New message",
      message: "Study group discussion updated",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 4,
      icon: Briefcase,
      title: "Project update",
      message: "Your application was accepted",
      time: "1 day ago",
      unread: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-white/90">
          Here's what's happening in your campus community today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Connections</p>
              <p className="text-2xl font-bold mt-1">127</p>
            </div>
            <Users className="w-10 h-10 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold mt-1">3</p>
            </div>
            <Briefcase className="w-10 h-10 text-secondary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clubs Joined</p>
              <p className="text-2xl font-bold mt-1">5</p>
            </div>
            <Users className="w-10 h-10 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Events RSVP'd</p>
              <p className="text-2xl font-bold mt-1">8</p>
            </div>
            <Calendar className="w-10 h-10 text-secondary" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Suggested Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Suggested Projects</h2>
              <Link to="/projects">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {suggestedProjects.map((project) => (
                <Card key={project.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                          <TrendingUp className="w-3 h-3" />
                          {project.matchScore}% Match
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.techStack.map((tech) => (
                          <Tag key={tech} variant="primary">{tech}</Tag>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.roles.map((role) => (
                          <Tag key={role} variant="secondary">{role}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button>Apply Now</Button>
                    <Button variant="outline">Learn More</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Club Announcements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Club Announcements</h2>
              <Link to="/clubs">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <Card className="divide-y divide-border">
              {clubAnnouncements.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {item.club[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{item.club}</h3>
                        <span className="text-sm text-muted-foreground">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{item.announcement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* Right Column - Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Link to="/events">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="p-5">
                <h3 className="font-semibold mb-3">{event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
                <Button className="w-full">RSVP</Button>
              </Card>
            ))}
          </div>

          {/* Notifications Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Notifications</h2>
                <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {recentNotifications.filter(n => n.unread).length}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {recentNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <Card
                    key={notification.id}
                    className={`p-4 transition-all hover:shadow-md cursor-pointer ${
                      notification.unread ? "bg-accent border-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        {notification.unread && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
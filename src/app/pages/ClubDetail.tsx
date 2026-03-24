import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { Users, Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export function ClubDetail() {
  const events = [
    {
      id: 1,
      title: "React Workshop: Advanced Patterns",
      date: "Mar 16, 2026",
      time: "5:00 PM",
      location: "CS Building, Lab 3",
      attendees: 45,
    },
    {
      id: 2,
      title: "Hackathon Team Formation",
      date: "Mar 18, 2026",
      time: "6:30 PM",
      location: "Student Center",
      attendees: 67,
    },
  ];

  const announcements = [
    {
      id: 1,
      title: "New Workshop Series Starting!",
      content: "We're excited to announce a new series of advanced React workshops. Sign up now!",
      author: "Sarah Chen",
      time: "3 hours ago",
    },
    {
      id: 2,
      title: "Hackathon Registration Open",
      content: "Registration for the Spring Hackathon 2026 is now open. Form your teams early!",
      author: "Mike Johnson",
      time: "1 day ago",
    },
  ];

  const members = [
    { name: "Sarah Chen", role: "President" },
    { name: "Mike Johnson", role: "Vice President" },
    { name: "Emily Davis", role: "Events Coordinator" },
    { name: "Alex Kim", role: "Member" },
    { name: "Jessica Lee", role: "Member" },
    { name: "Tom Wilson", role: "Member" },
  ];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to="/clubs">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs
        </Button>
      </Link>

      {/* Club Header */}
      <Card className="p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            C
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Computer Science Club</h1>
                <Tag variant="muted">Technology</Tag>
              </div>
              <Button>Join Club</Button>
            </div>
            <p className="text-muted-foreground mb-4">
              The Computer Science Club is dedicated to fostering a community of passionate developers
              and tech enthusiasts. We organize weekly coding workshops, hackathons, tech talks with
              industry professionals, and collaborative projects. Whether you're a beginner or advanced
              programmer, everyone is welcome!
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span className="font-semibold">234 members</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Events */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="p-6">
                  <h3 className="font-bold text-lg mb-3">{event.title}</h3>
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
                  <Button>RSVP to Event</Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Announcements</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar name={announcement.author} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{announcement.author}</p>
                          <p className="text-sm text-muted-foreground">{announcement.time}</p>
                        </div>
                      </div>
                      <h3 className="font-bold mb-2">{announcement.title}</h3>
                      <p className="text-muted-foreground">{announcement.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leadership */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Club Leadership</h3>
            <div className="space-y-4">
              {members.slice(0, 3).map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Members */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Recent Members</h3>
            <div className="space-y-3">
              {members.slice(3).map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Members
            </Button>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Club Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Events</span>
                <span className="font-semibold">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Projects</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Founded</span>
                <span className="font-semibold">2018</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

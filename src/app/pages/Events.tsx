import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Calendar, MapPin, Users, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function Events() {
  const [currentMonth] = useState("March 2026");

  const events = [
    {
      id: 1,
      title: "Tech Talk: Web3 & Blockchain",
      date: "Mar 15, 2026",
      time: "6:00 PM",
      location: "Engineering Building, Room 301",
      category: "Technology",
      attendees: 42,
      organizer: "Computer Science Club",
      description: "Learn about the future of decentralized web and blockchain technology",
    },
    {
      id: 2,
      title: "Hackathon 2026",
      date: "Mar 20-21, 2026",
      time: "9:00 AM",
      location: "Student Center",
      category: "Competition",
      attendees: 156,
      organizer: "Tech Innovation Lab",
      description: "24-hour coding competition with prizes and networking opportunities",
    },
    {
      id: 3,
      title: "Career Fair",
      date: "Mar 22, 2026",
      time: "10:00 AM",
      location: "Main Hall",
      category: "Career",
      attendees: 203,
      organizer: "Career Services",
      description: "Meet top tech companies and explore internship opportunities",
    },
    {
      id: 4,
      title: "AI/ML Workshop",
      date: "Mar 16, 2026",
      time: "5:00 PM",
      location: "CS Building, Lab 3",
      category: "Workshop",
      attendees: 67,
      organizer: "Data Science Society",
      description: "Hands-on workshop on building neural networks with TensorFlow",
    },
    {
      id: 5,
      title: "Startup Pitch Night",
      date: "Mar 18, 2026",
      time: "7:00 PM",
      location: "Innovation Hub",
      category: "Business",
      attendees: 89,
      organizer: "Entrepreneurship Club",
      description: "Watch student startups pitch their ideas to investors",
    },
    {
      id: 6,
      title: "React Native Bootcamp",
      date: "Mar 19, 2026",
      time: "2:00 PM",
      location: "Online",
      category: "Workshop",
      attendees: 124,
      organizer: "Web Development Guild",
      description: "Build your first mobile app with React Native",
    },
  ];

  const categories = ["All", "Technology", "Workshop", "Competition", "Career", "Business", "Social"];

  // Mock calendar data
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventDays = [15, 16, 18, 19, 20, 21, 22];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
        <p className="text-muted-foreground">
          Discover and attend events happening around campus
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-3 bg-card rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "primary" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">{currentMonth}</h2>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-muted rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-1 hover:bg-muted rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {/* Starting day offset (March 2026 starts on Sunday) */}
              {daysInMonth.map((day) => (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${
                    eventDays.includes(day)
                      ? "bg-primary text-white font-semibold"
                      : day === 12
                      ? "bg-muted font-semibold"
                      : "hover:bg-muted"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-muted-foreground">Events scheduled</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <Tag variant="primary" className="text-xs">{event.category}</Tag>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
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
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">
                      Organized by <span className="font-medium text-foreground">{event.organizer}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button>RSVP</Button>
                <Button variant="outline">Share</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

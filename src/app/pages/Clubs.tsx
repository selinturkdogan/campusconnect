import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Users, Search } from "lucide-react";
import { Link } from "react-router";

export function Clubs() {
  const clubs = [
    {
      id: 1,
      name: "Computer Science Club",
      category: "Technology",
      description: "Weekly coding workshops, hackathons, and tech talks",
      members: 234,
      logo: "C",
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: 2,
      name: "Robotics Club",
      category: "Engineering",
      description: "Build robots, compete in tournaments, and learn automation",
      members: 156,
      logo: "R",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      name: "Data Science Society",
      category: "Technology",
      description: "Explore data analytics, machine learning, and AI projects",
      members: 189,
      logo: "D",
      color: "from-green-500 to-teal-500",
    },
    {
      id: 4,
      name: "Entrepreneurship Club",
      category: "Business",
      description: "Learn startup skills, network with founders, pitch competitions",
      members: 312,
      logo: "E",
      color: "from-orange-500 to-red-500",
    },
    {
      id: 5,
      name: "Web Development Guild",
      category: "Technology",
      description: "Full-stack web development, React, Node.js, and modern frameworks",
      members: 198,
      logo: "W",
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: 6,
      name: "AI & Machine Learning Lab",
      category: "Research",
      description: "Cutting-edge ML research, paper discussions, and practical projects",
      members: 142,
      logo: "A",
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: 7,
      name: "Cybersecurity Alliance",
      category: "Technology",
      description: "Learn ethical hacking, network security, and participate in CTFs",
      members: 167,
      logo: "C",
      color: "from-red-500 to-orange-500",
    },
    {
      id: 8,
      name: "Design Collective",
      category: "Creative",
      description: "UI/UX design workshops, portfolio reviews, and design challenges",
      members: 223,
      logo: "D",
      color: "from-pink-500 to-purple-500",
    },
  ];

  const categories = ["All", "Technology", "Engineering", "Business", "Research", "Creative"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Student Clubs</h1>
        <p className="text-muted-foreground">
          Discover and join clubs that match your interests
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clubs..."
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

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Card key={club.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${club.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}
              >
                {club.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1 truncate">{club.name}</h3>
                <Tag variant="muted" className="text-xs">{club.category}</Tag>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {club.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{club.members} members</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to={`/clubs/${club.id}`} className="flex-1">
                <Button variant="outline" className="w-full">View Club</Button>
              </Link>
              <Button className="flex-1">Join</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

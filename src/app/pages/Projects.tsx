import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { Search, Users, TrendingUp } from "lucide-react";

export function Projects() {
  const projects = [
    {
      id: 1,
      title: "AI Study Assistant Web App",
      description: "Build an AI-powered study assistant using React and OpenAI API. Help students organize notes, generate quizzes, and get personalized study recommendations.",
      owner: "Sarah Chen",
      roles: ["Frontend Dev", "UI Designer", "Backend Dev"],
      techStack: ["React", "TypeScript", "Node.js", "OpenAI API", "MongoDB"],
      teamSize: "3/5 members",
      matchScore: 95,
      status: "Recruiting",
    },
    {
      id: 2,
      title: "Campus Events Mobile App",
      description: "React Native app for discovering and managing campus events. Features include event recommendations, calendar integration, and social features.",
      owner: "Mike Johnson",
      roles: ["Mobile Dev", "Backend Dev"],
      techStack: ["React Native", "Node.js", "MongoDB", "Firebase"],
      teamSize: "4/6 members",
      matchScore: 88,
      status: "Recruiting",
    },
    {
      id: 3,
      title: "Blockchain Voting System",
      description: "Secure and transparent voting system for student organizations using blockchain technology and smart contracts.",
      owner: "Alex Kim",
      roles: ["Blockchain Dev", "Smart Contract Dev", "Frontend Dev"],
      techStack: ["Ethereum", "Solidity", "Web3.js", "React"],
      teamSize: "2/4 members",
      matchScore: 76,
      status: "Recruiting",
    },
    {
      id: 4,
      title: "Virtual Lab Simulator",
      description: "VR-based chemistry lab simulator for remote learning. Built with Unity and VR technology.",
      owner: "Emily Davis",
      roles: ["Unity Developer", "3D Artist", "UX Designer"],
      techStack: ["Unity", "C#", "Oculus SDK", "Blender"],
      teamSize: "3/5 members",
      matchScore: 82,
      status: "Recruiting",
    },
    {
      id: 5,
      title: "Study Group Finder",
      description: "Platform to help students find and join study groups based on courses, availability, and learning styles.",
      owner: "Tom Wilson",
      roles: ["Full Stack Dev", "UI/UX Designer"],
      techStack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
      teamSize: "2/4 members",
      matchScore: 91,
      status: "Recruiting",
    },
    {
      id: 6,
      title: "Campus Navigation AR App",
      description: "Augmented reality app to help new students navigate campus with real-time directions and building information.",
      owner: "Jessica Lee",
      roles: ["AR Developer", "Mobile Dev", "Backend Dev"],
      techStack: ["ARKit", "Swift", "Node.js", "MongoDB"],
      teamSize: "3/5 members",
      matchScore: 73,
      status: "Recruiting",
    },
  ];

  const filters = ["All Projects", "High Match", "Recently Posted", "Few Spots Left"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Student Projects</h1>
        <p className="text-muted-foreground">
          Find exciting projects to collaborate on and build your portfolio
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects by title, tech stack, or role..."
            className="w-full pl-10 pr-4 py-3 bg-card rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={filter === "All Projects" ? "primary" : "outline"}
              size="sm"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl">{project.title}</h3>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {project.matchScore}% Match
                  </div>
                  <Tag variant="primary" className="text-xs">{project.status}</Tag>
                </div>
                <p className="text-muted-foreground mb-4">{project.description}</p>

                {/* Owner Info */}
                <div className="flex items-center gap-2 mb-4">
                  <Avatar name={project.owner} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{project.owner}</p>
                    <p className="text-xs text-muted-foreground">Project Lead</p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Tag key={tech} variant="primary">{tech}</Tag>
                    ))}
                  </div>
                </div>

                {/* Roles Needed */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Roles Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {project.roles.map((role) => (
                      <Tag key={role} variant="secondary">{role}</Tag>
                    ))}
                  </div>
                </div>

                {/* Team Size */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Users className="w-4 h-4" />
                  <span>Team: {project.teamSize}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button>Apply to Join</Button>
              <Button variant="outline">Learn More</Button>
              <Button variant="ghost">Save</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Project CTA */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Have a project idea?</h3>
          <p className="text-muted-foreground mb-6">
            Create your own project and find talented teammates to bring it to life
          </p>
          <Button size="lg">Create New Project</Button>
        </div>
      </Card>
    </div>
  );
}

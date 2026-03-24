import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { Github, Linkedin, Mail, MapPin, GraduationCap, Edit, Sparkles } from "lucide-react";

export function Profile() {
  const skills = [
    "React", "TypeScript", "Node.js", "Python", "Machine Learning",
    "UI/UX Design", "MongoDB", "GraphQL", "Docker", "AWS"
  ];

  const courses = [
    { code: "CS 401", name: "Advanced Algorithms", semester: "Spring 2026" },
    { code: "CS 445", name: "Machine Learning", semester: "Spring 2026" },
    { code: "CS 420", name: "Database Systems", semester: "Spring 2026" },
    { code: "CS 350", name: "Software Engineering", semester: "Fall 2025" },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex items-start gap-6">
          <Avatar name="John Doe" size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">John Doe</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>Computer Science, Senior</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Stanford University</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>github.com/johndoe</span>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>linkedin.com/in/johndoe</span>
                  </a>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>john.doe@stanford.edu</span>
                  </div>
                </div>
              </div>
              <Button variant="outline">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              Passionate computer science student with a focus on full-stack development
              and machine learning. Love building products that make a difference. Always
              looking for interesting projects and collaborations. Currently working on
              an AI-powered study assistant and exploring opportunities in web3.
            </p>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Skills & Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Tag key={skill} variant="primary">{skill}</Tag>
              ))}
            </div>
          </Card>

          {/* Courses */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Current & Recent Courses</h2>
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.code}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{course.code}</p>
                    <p className="text-sm text-muted-foreground">{course.name}</p>
                  </div>
                  <Tag variant="muted">{course.semester}</Tag>
                </div>
              ))}
            </div>
          </Card>

          {/* Projects */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Active Projects</h2>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">AI Study Assistant</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Leading a team building an AI-powered study assistant web app
                </p>
                <div className="flex flex-wrap gap-2">
                  <Tag variant="primary">React</Tag>
                  <Tag variant="primary">OpenAI</Tag>
                  <Tag variant="secondary">Team Lead</Tag>
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Campus Events Platform</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Contributing to the frontend of a new campus events discovery platform
                </p>
                <div className="flex flex-wrap gap-2">
                  <Tag variant="primary">React Native</Tag>
                  <Tag variant="primary">TypeScript</Tag>
                  <Tag variant="secondary">Frontend Dev</Tag>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - AI Suggestions */}
        <div>
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">AI Profile Insights</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold mb-2 text-sm">Recommended Connections</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar name="Sarah Chen" size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">ML Researcher</p>
                    </div>
                    <Button size="sm" variant="outline">Connect</Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar name="Mike Johnson" size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Mike Johnson</p>
                      <p className="text-xs text-muted-foreground">Full Stack Dev</p>
                    </div>
                    <Button size="sm" variant="outline">Connect</Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold mb-2 text-sm">Skill Suggestions</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your projects and interests, consider learning:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Tag variant="secondary">TensorFlow</Tag>
                  <Tag variant="secondary">Kubernetes</Tag>
                  <Tag variant="secondary">Next.js</Tag>
                </div>
              </div>

              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold mb-2 text-sm">Profile Completeness</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profile strength</span>
                    <span className="font-semibold text-primary">85%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Add a profile photo to reach 100%
                  </p>
                </div>
              </div>

              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold mb-2 text-sm">Recommended Clubs</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI & ML Club</span>
                    <Button size="sm" variant="ghost">Join</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Startup Incubator</span>
                    <Button size="sm" variant="ghost">Join</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

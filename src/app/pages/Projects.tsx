import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { Search, Users, Plus, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

interface Project {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  tech_stack: string[];
  roles_needed: string[];
  status: string;
  github_url?: string;
  created_at: string;
}

interface ApplicationForm {
  role: string;
  motivation: string;
}

export function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [applyingTo, setApplyingTo] = useState<Project | null>(null);
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({ role: "", motivation: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    tech_stack: "",
    roles_needed: "",
    github_url: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/projects/");
      setProjects(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    try {
      setIsSubmitting(true);
      await apiFetch("/api/projects/", {
        method: "POST",
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description,
          tech_stack: createForm.tech_stack.split(",").map((s) => s.trim()).filter(Boolean),
          roles_needed: createForm.roles_needed.split(",").map((s) => s.trim()).filter(Boolean),
          github_url: createForm.github_url || null,
        }),
      });
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", tech_stack: "", roles_needed: "", github_url: "" });
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApply() {
    if (!applyingTo) return;
    try {
      setIsSubmitting(true);
      await apiFetch(`/api/projects/${applyingTo.id}/apply`, {
        method: "POST",
        body: JSON.stringify(applicationForm),
      });
      setApplyingTo(null);
      setApplicationForm({ role: "", motivation: "" });
      alert("Application submitted successfully!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tech_stack.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold mb-2">Student Projects</h1>
          <p className="text-muted-foreground">Find exciting projects to collaborate on</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Post Project
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects by title or tech stack..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No projects found.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filtered.map((project) => (
            <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-xl">{project.title}</h3>
                <Tag variant={project.status === "open" ? "primary" : "muted"}>
                  {project.status}
                </Tag>
              </div>
              <p className="text-muted-foreground mb-4">{project.description}</p>

              {project.tech_stack.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech) => (
                      <Tag key={tech} variant="primary">{tech}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {project.roles_needed.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Roles Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {project.roles_needed.map((role) => (
                      <Tag key={role} variant="secondary">{role}</Tag>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                {project.status === "open" && project.owner_id !== user?.user_id && (
                  <Button onClick={() => setApplyingTo(project)}>Apply to Join</Button>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">View GitHub</Button>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Post a New Project</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Project title"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe your project..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tech Stack (comma separated)</label>
                <input
                  value={createForm.tech_stack}
                  onChange={(e) => setCreateForm({ ...createForm, tech_stack: e.target.value })}
                  placeholder="React, Python, PostgreSQL"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Roles Needed (comma separated)</label>
                <input
                  value={createForm.roles_needed}
                  onChange={(e) => setCreateForm({ ...createForm, roles_needed: e.target.value })}
                  placeholder="Frontend Dev, UI Designer"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">GitHub URL (optional)</label>
                <input
                  value={createForm.github_url}
                  onChange={(e) => setCreateForm({ ...createForm, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreate} disabled={isSubmitting || !createForm.title || !createForm.description}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Project"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Apply to Project</h2>
              <button onClick={() => setApplyingTo(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-muted-foreground mb-4">{applyingTo.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Role you're applying for</label>
                <select
                  value={applicationForm.role}
                  onChange={(e) => setApplicationForm({ ...applicationForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a role</option>
                  {applyingTo.roles_needed.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Motivation</label>
                <textarea
                  value={applicationForm.motivation}
                  onChange={(e) => setApplicationForm({ ...applicationForm, motivation: e.target.value })}
                  placeholder="Why do you want to join this project?"
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleApply}
                disabled={isSubmitting || !applicationForm.role || !applicationForm.motivation}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
              </Button>
              <Button variant="outline" onClick={() => setApplyingTo(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

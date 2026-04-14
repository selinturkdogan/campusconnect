import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import {
  Github, Linkedin, Mail, MapPin, GraduationCap,
  Edit, X, Loader2, Check, Sparkles, BookOpen,
  AlertCircle, RefreshCw
} from "lucide-react";
import { apiFetch } from "../lib/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  university?: string;
  department?: string;
  year?: number;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  bio?: string;
  skills?: string[];
  courses?: string[];
}

interface AIAnalysis {
  missing_fields: string[];
  tips: string[];
  club_suggestions: string[];
  event_suggestions: string[];
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    university: "",
    department: "",
    year: "",
    github_url: "",
    linkedin_url: "",
    bio: "",
    skills: "",
    courses: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/auth/me");
      setProfile(data);
      setEditForm({
        name: data.name || "",
        university: data.university || "",
        department: data.department || "",
        year: data.year?.toString() || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        bio: data.bio || "",
        skills: (data.skills || []).join(", "),
        courses: (data.courses || []).join(", "),
      });
    } catch {
      console.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name || undefined,
          university: editForm.university || undefined,
          department: editForm.department || undefined,
          year: editForm.year ? parseInt(editForm.year) : undefined,
          github_url: editForm.github_url || undefined,
          linkedin_url: editForm.linkedin_url || undefined,
          bio: editForm.bio || undefined,
          skills: editForm.skills
            ? editForm.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
          courses: editForm.courses
            ? editForm.courses.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
        }),
      });
      setSaveSuccess(true);
      setIsEditing(false);
      fetchProfile();
      // Invalidate AI cache on profile update
      setAiAnalysis(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function fetchAIAnalysis() {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      const data = await apiFetch("/api/auth/ai-analysis", { method: "POST" });
      setAiAnalysis(data);
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-muted-foreground">Profile not found.</div>;
  }

  return (
    <div className="space-y-8">
      {saveSuccess && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 text-sm">
          <Check className="w-4 h-4" />
          Profile updated successfully!
        </div>
      )}

      {/* ── Header card ── */}
      <Card className="p-8">
        <div className="flex items-start gap-6">
          <Avatar name={profile.name} size="xl" src={profile.avatar_url} />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4 flex-wrap">
                  {(profile.department || profile.year) && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>
                        {profile.department}
                        {profile.year ? `, Year ${profile.year}` : ""}
                      </span>
                    </div>
                  )}
                  {profile.university && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.university}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>{profile.github_url.replace("https://github.com/", "")}</span>
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* ── About ── */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">About</h2>
            {profile.bio ? (
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-muted-foreground italic">No bio yet. Click Edit Profile to add one.</p>
            )}
          </Card>

          {/* ── Skills ── */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Skills</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Tag key={skill} variant="primary">{skill}</Tag>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No skills added yet.</p>
            )}
          </Card>

          {/* ── Courses ── */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Current Courses</h2>
            </div>
            {profile.courses && profile.courses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.courses.map((course) => (
                  <Tag key={course} variant="muted">{course}</Tag>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No courses added yet.</p>
            )}
          </Card>

          {/* ── AI Profile Analysis ── */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">AI Profile Analysis</h2>
              </div>
              <Button
                variant="outline"
                onClick={fetchAIAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : aiAnalysis ? (
                  <><RefreshCw className="w-4 h-4" /> Refresh</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Profile</>
                )}
              </Button>
            </div>

            {analysisError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {analysisError}
              </div>
            )}

            {!aiAnalysis && !isAnalyzing && !analysisError && (
              <p className="text-muted-foreground text-sm">
                Get personalized tips, club suggestions, and improvement ideas based on your profile.
                Analysis is cached for 24 hours.
              </p>
            )}

            {aiAnalysis && (
              <div className="space-y-5">
                {/* Missing fields warning */}
                {aiAnalysis.missing_fields.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      Complete your profile for better suggestions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.missing_fields.map((f) => (
                        <span
                          key={f}
                          className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full capitalize"
                        >
                          {f.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {aiAnalysis.tips.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-foreground">
                      Profile Improvement Tips
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Club suggestions */}
                {aiAnalysis.club_suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-foreground">
                      Suggested Clubs for You
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.club_suggestions.map((club) => (
                        <Tag key={club} variant="primary">{club}</Tag>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event suggestions */}
                {aiAnalysis.event_suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-foreground">
                      Recommended Event Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.event_suggestions.map((ev) => (
                        <Tag key={ev} variant="muted">{ev}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div>
          <Card className="p-6">
            <h3 className="font-bold mb-4">Profile Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Tag variant={profile.role === "admin" ? "primary" : "muted"} className="text-xs capitalize">
                  {profile.role}
                </Tag>
              </div>
              {profile.university && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">University</span>
                  <span className="font-medium text-right max-w-[60%]">{profile.university}</span>
                </div>
              )}
              {profile.department && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium text-right max-w-[60%]">{profile.department}</span>
                </div>
              )}
              {profile.year && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year</span>
                  <span className="font-medium">Year {profile.year}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skills</span>
                <span className="font-medium">{profile.skills?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Courses</span>
                <span className="font-medium">{profile.courses?.length || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">University</label>
                <input
                  value={editForm.university}
                  onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                  placeholder="e.g. Final International University"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Department</label>
                <input
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="e.g. Software Engineering"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Year</label>
                <select
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select year</option>
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Skills <span className="text-muted-foreground font-normal">(comma separated)</span>
                </label>
                <input
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="React, Python, TypeScript"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Current Courses <span className="text-muted-foreground font-normal">(comma separated)</span>
                </label>
                <input
                  value={editForm.courses}
                  onChange={(e) => setEditForm({ ...editForm, courses: e.target.value })}
                  placeholder="Data Structures, Web Development, Algorithms"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">GitHub URL</label>
                <input
                  value={editForm.github_url}
                  onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">LinkedIn URL</label>
                <input
                  value={editForm.linkedin_url}
                  onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Users, Search, Plus, X, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url?: string;
  admin_user_id: string;
  is_open: boolean;
  created_at: string;
}

const CATEGORIES = ["All", "Technical", "Social", "Sports", "Arts", "Research", "Business"];

const CLUB_COLORS: Record<string, string> = {
  Technical: "from-blue-500 to-indigo-500",
  Social: "from-green-500 to-teal-500",
  Sports: "from-orange-500 to-red-500",
  Arts: "from-pink-500 to-purple-500",
  Research: "from-cyan-500 to-blue-500",
  Business: "from-yellow-500 to-orange-500",
  default: "from-primary to-secondary",
};

export function Clubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    category: "Technical",
    is_open: true,
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/clubs/");
      setClubs(data);
    } catch (err) {
      console.error("Failed to load clubs");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    try {
      setIsSubmitting(true);
      await apiFetch("/api/clubs/", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", category: "Technical", is_open: true });
      fetchClubs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create club");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleJoin(clubId: string) {
    try {
      setJoiningId(clubId);
      await apiFetch(`/api/clubs/${clubId}/join`, { method: "POST" });
      alert("Successfully joined!");
      fetchClubs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to join club");
    } finally {
      setJoiningId(null);
    }
  }

  const filtered = clubs.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCategory;
  });

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
          <h1 className="text-3xl font-bold mb-2">Student Clubs</h1>
          <p className="text-muted-foreground">Discover and join clubs that match your interests</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Create Club
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No clubs found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((club) => (
            <Card key={club.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${CLUB_COLORS[club.category] || CLUB_COLORS.default} rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                  {club.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 truncate">{club.name}</h3>
                  <Tag variant="muted" className="text-xs">{club.category}</Tag>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{club.description}</p>

              <div className="mb-4">
                <Tag variant={club.is_open ? "primary" : "secondary"} className="text-xs">
                  {club.is_open ? "Open" : "Approval Required"}
                </Tag>
              </div>

              <div className="flex gap-2">
                <Link to={`/clubs/${club.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">View Club</Button>
                </Link>
                {club.admin_user_id !== user?.user_id && (
                  <Button
                    className="flex-1"
                    onClick={() => handleJoin(club.id)}
                    disabled={joiningId === club.id}
                  >
                    {joiningId === club.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create a New Club</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Club Name</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Club name"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="What is this club about?"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_open"
                  checked={createForm.is_open}
                  onChange={(e) => setCreateForm({ ...createForm, is_open: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_open" className="text-sm">Open membership (anyone can join instantly)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !createForm.name || !createForm.description}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Club"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

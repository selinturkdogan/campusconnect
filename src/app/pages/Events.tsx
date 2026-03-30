import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Calendar, MapPin, Users, Clock, Search, Plus, X, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Event {
  id: string;
  title: string;
  description: string;
  club_id?: string;
  created_by: string;
  event_date: string;
  location: string;
  capacity?: number;
  is_school_wide: boolean;
  created_at: string;
}

export function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendingIds, setAttendingIds] = useState<Set<string>>(new Set());

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    capacity: "",
    is_school_wide: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/events/");
      setEvents(data);
    } catch {
      console.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    try {
      setIsSubmitting(true);
      await apiFetch("/api/events/", {
        method: "POST",
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description,
          event_date: new Date(createForm.event_date).toISOString(),
          location: createForm.location,
          capacity: createForm.capacity ? parseInt(createForm.capacity) : null,
          is_school_wide: createForm.is_school_wide,
        }),
      });
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", event_date: "", location: "", capacity: "", is_school_wide: false });
      fetchEvents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAttend(eventId: string) {
    try {
      if (attendingIds.has(eventId)) {
        await apiFetch(`/api/events/${eventId}/attend`, { method: "DELETE" });
        setAttendingIds((prev) => { const s = new Set(prev); s.delete(eventId); return s; });
      } else {
        await apiFetch(`/api/events/${eventId}/attend`, { method: "POST" });
        setAttendingIds((prev) => new Set(prev).add(eventId));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update attendance");
    }
  }

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
          <p className="text-muted-foreground">Discover and attend events happening around campus</p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No events found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((event) => (
            <Card key={event.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg">{event.title}</h3>
                <div className="flex gap-2">
                  {event.is_school_wide && <Tag variant="primary" className="text-xs">School-Wide</Tag>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(event.event_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                {event.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Capacity: {event.capacity}</span>
                  </div>
                )}
              </div>
              <Button
                variant={attendingIds.has(event.id) ? "outline" : "primary"}
                onClick={() => handleAttend(event.id)}
              >
                {attendingIds.has(event.id) ? "Cancel RSVP" : "RSVP"}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Event</h2>
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
                  placeholder="Event title"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  value={createForm.event_date}
                  onChange={(e) => setCreateForm({ ...createForm, event_date: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <input
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  placeholder="Physical location or Online"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Capacity (optional)</label>
                <input
                  type="number"
                  value={createForm.capacity}
                  onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })}
                  placeholder="Max attendees"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_school_wide"
                  checked={createForm.is_school_wide}
                  onChange={(e) => setCreateForm({ ...createForm, is_school_wide: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_school_wide" className="text-sm">School-wide event (notify all students)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !createForm.title || !createForm.event_date || !createForm.location}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Event"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

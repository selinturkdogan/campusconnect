import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import {
  Calendar, MapPin, Users, Clock, Search,
  Plus, X, Loader2, ChevronLeft, ChevronRight,
  List, CalendarDays, Check
} from "lucide-react";
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
  attendee_count?: number;
}

interface Club {
  id: string;
  name: string;
  admin_user_id: string;
}

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [myAdminClubs, setMyAdminClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "attending">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendingIds, setAttendingIds] = useState<Set<string>>(new Set());

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    capacity: "",
    is_school_wide: false,
    club_id: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchAttending();
    fetchMyAdminClubs();
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

  async function fetchAttending() {
    try {
      const data = await apiFetch("/api/events/my-attending");
      setAttendingIds(new Set(data.map((e: { event_id: string }) => e.event_id)));
    } catch {
      // ignore if endpoint not ready
    }
  }

  async function fetchMyAdminClubs() {
    try {
      const data = await apiFetch("/api/clubs/");
      const adminClubs = data.filter((c: Club) => c.admin_user_id === user?.user_id);
      setMyAdminClubs(adminClubs);
    } catch {
      // ignore
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
          club_id: createForm.club_id || null,
        }),
      });
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", event_date: "", location: "", capacity: "", is_school_wide: false, club_id: "" });
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
        setEvents((prev) => prev.map((e) =>
          e.id === eventId ? { ...e, attendee_count: Math.max(0, (e.attendee_count || 1) - 1) } : e
        ));
      } else {
        await apiFetch(`/api/events/${eventId}/attend`, { method: "POST" });
        setAttendingIds((prev) => new Set(prev).add(eventId));
        setEvents((prev) => prev.map((e) =>
          e.id === eventId ? { ...e, attendee_count: (e.attendee_count || 0) + 1 } : e
        ));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update attendance");
    }
  }

  // Can create event: admin OR club admin
  const canCreateEvent = user?.role === "admin" || myAdminClubs.length > 0;

  const now = new Date();
  const filtered = events.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    const eDate = new Date(e.event_date);
    if (filter === "upcoming") return eDate >= now;
    if (filter === "past") return eDate < now;
    if (filter === "attending") return attendingIds.has(e.id);
    return true;
  });

  // Calendar helpers
  function getDaysInMonth(month: number, year: number) {
    return new Date(year, month + 1, 0).getDate();
  }
  function getFirstDayOfMonth(month: number, year: number) {
    return new Date(year, month, 1).getDay();
  }
  function getEventsForDay(day: number) {
    return events.filter((e) => {
      const d = new Date(e.event_date);
      return d.getDate() === day && d.getMonth() === calMonth && d.getFullYear() === calYear;
    });
  }

  const daysInMonth = getDaysInMonth(calMonth, calYear);
  const firstDay = getFirstDayOfMonth(calMonth, calYear);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
          <p className="text-muted-foreground">Discover and attend events happening around campus</p>
        </div>
        {canCreateEvent && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Search + filters + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["upcoming", "all", "past", "attending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {f === "attending" ? "My Events" : f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded transition-colors ${viewMode === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">{MONTHS[calMonth]} {calYear}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                day === today.getDate() &&
                calMonth === today.getMonth() &&
                calYear === today.getFullYear();
              return (
                <div
                  key={day}
                  className={`min-h-[80px] p-1 rounded-lg border transition-colors ${
                    isToday ? "border-primary bg-primary/5" : "border-transparent hover:border-border"
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className={`text-xs px-1.5 py-0.5 rounded truncate font-medium ${
                          e.is_school_wide
                            ? "bg-primary/15 text-primary"
                            : "bg-secondary/15 text-secondary"
                        }`}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary/15" />
              <span>School-wide</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-secondary/15" />
              <span>Club event</span>
            </div>
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No events found.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((event) => {
                const isPast = new Date(event.event_date) < now;
                const isAttending = attendingIds.has(event.id);
                return (
                  <Card key={event.id} className={`p-6 hover:shadow-md transition-shadow ${isPast ? "opacity-70" : ""}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {event.is_school_wide && <Tag variant="primary" className="text-xs">School-Wide</Tag>}
                        {event.club_id && !event.is_school_wide && <Tag variant="muted" className="text-xs">Club Event</Tag>}
                        {isAttending && (
                          <Tag variant="primary" className="text-xs flex items-center gap-1">
                            <Check className="w-3 h-3" /> Attending
                          </Tag>
                        )}
                        {isPast && <Tag variant="muted" className="text-xs">Past</Tag>}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.event_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(event.event_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.attendee_count ?? 0} attending
                          {event.capacity ? ` / ${event.capacity} capacity` : ""}
                        </span>
                      </div>
                    </div>
                    {!isPast && (
                      <Button
                        variant={isAttending ? "outline" : "primary"}
                        onClick={() => handleAttend(event.id)}
                      >
                        {isAttending ? "Cancel RSVP" : "RSVP"}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

              {/* Club event selector — only for club admins */}
              {myAdminClubs.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Link to Club (optional)</label>
                  <select
                    value={createForm.club_id}
                    onChange={(e) => setCreateForm({ ...createForm, club_id: e.target.value, is_school_wide: false })}
                    className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">None (general event)</option>
                    {myAdminClubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* School-wide toggle — admin only, only if no club selected */}
              {user?.role === "admin" && !createForm.club_id && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_school_wide"
                    checked={createForm.is_school_wide}
                    onChange={(e) => setCreateForm({ ...createForm, is_school_wide: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_school_wide" className="text-sm">
                    School-wide event <span className="text-muted-foreground">(notifies all students)</span>
                  </label>
                </div>
              )}
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
import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { Users, ArrowLeft, Loader2, UserPlus, UserMinus } from "lucide-react";
import { Link, useParams } from "react-router";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  admin_user_id: string;
  is_open: boolean;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  status: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  capacity?: number;
}

export function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const [clubData, membersData, eventsData] = await Promise.all([
        apiFetch(`/api/clubs/${id}`),
        apiFetch(`/api/clubs/${id}/members`),
        apiFetch(`/api/events/`),
      ]);
      setClub(clubData);
      setMembers(membersData);
      setEvents(eventsData.filter((e: Event & { club_id: string }) => e.club_id === id));
      setIsMember(membersData.some((m: Member) => m.user_id === user?.user_id && m.status === "approved"));
    } catch (err) {
      console.error("Failed to load club");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoin() {
    try {
      setIsJoining(true);
      await apiFetch(`/api/clubs/${id}/join`, { method: "POST" });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setIsJoining(false);
    }
  }

  async function handleLeave() {
    try {
      setIsJoining(true);
      await apiFetch(`/api/clubs/${id}/leave`, { method: "DELETE" });
      setIsMember(false);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to leave");
    } finally {
      setIsJoining(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!club) {
    return <div className="text-center py-12 text-muted-foreground">Club not found.</div>;
  }

  const approvedMembers = members.filter((m) => m.status === "approved");
  const isAdmin = club.admin_user_id === user?.user_id;

  return (
    <div className="space-y-8">
      <Link to="/clubs">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs
        </Button>
      </Link>

      <Card className="p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            {club.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
                <div className="flex gap-2">
                  <Tag variant="muted">{club.category}</Tag>
                  <Tag variant={club.is_open ? "primary" : "secondary"}>
                    {club.is_open ? "Open" : "Approval Required"}
                  </Tag>
                </div>
              </div>
              {!isAdmin && (
                isMember ? (
                  <Button variant="outline" onClick={handleLeave} disabled={isJoining}>
                    {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserMinus className="w-4 h-4" /> Leave Club</>}
                  </Button>
                ) : (
                  <Button onClick={handleJoin} disabled={isJoining}>
                    {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Join Club</>}
                  </Button>
                )
              )}
            </div>
            <p className="text-muted-foreground mb-4">{club.description}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{approvedMembers.length} members</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
            {events.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No upcoming events.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="p-6">
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                      <span>📍 {event.location}</span>
                      {event.capacity && <span>👥 {event.capacity} spots</span>}
                    </div>
                    <Button className="mt-4">RSVP</Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Members ({approvedMembers.length})</h3>
            <div className="space-y-3">
              {approvedMembers.slice(0, 8).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar name={member.user_id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.user_id.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import {
  Users, ArrowLeft, Loader2, UserPlus, UserMinus,
  Check, X, Settings, Video, Upload, Trash2, Shield
} from "lucide-react";
import { Link, useParams } from "react-router";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { getStoredToken } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  admin_user_id: string;
  is_open: boolean;
  video_url?: string;
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
  club_id: string;
}

const CATEGORIES = ["Technical", "Social", "Sports", "Arts", "Research", "Business"];

export function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "manage">("overview");
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSavingClub, setIsSavingClub] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    is_open: true,
  });

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
      setEvents(eventsData.filter((e: Event) => e.club_id === id));
      setEditForm({
        name: clubData.name,
        description: clubData.description,
        category: clubData.category,
        is_open: clubData.is_open,
      });
    } catch {
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
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to leave");
    } finally {
      setIsJoining(false);
    }
  }

  async function handleMembershipUpdate(userId: string, status: "approved" | "rejected") {
    try {
      setUpdatingMemberId(userId);
      await apiFetch(`/api/clubs/${id}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      setUpdatingMemberId(userId);
      await apiFetch(`/api/clubs/${id}/members/${userId}/remove`, { method: "DELETE" });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function handleRoleUpdate(userId: string, role: string) {
    try {
      setUpdatingMemberId(userId);
      await apiFetch(`/api/clubs/${id}/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function handleSaveClub() {
    try {
      setIsSavingClub(true);
      await apiFetch(`/api/clubs/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      fetchData();
      alert("Club updated successfully!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update club");
    } finally {
      setIsSavingClub(false);
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert("Video must be under 100MB");
      return;
    }

    try {
      setIsUploadingVideo(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = getStoredToken();
      const response = await fetch(`${API_BASE}/api/clubs/${id}/upload-video`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      fetchData();
      alert("Video uploaded successfully!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload video");
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  async function handleDeleteVideo() {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await apiFetch(`/api/clubs/${id}/delete-video`, { method: "DELETE" });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete video");
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
  const pendingMembers = members.filter((m) => m.status === "pending");
  const isAdmin = user?.role === "admin" || club.admin_user_id === user?.user_id;
  const isClubMember = members.some((m) => m.user_id === user?.user_id);
  const isApprovedMember = members.some((m) => m.user_id === user?.user_id && m.status === "approved");

  return (
    <div className="space-y-8">
      <Link to="/clubs">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs
        </Button>
      </Link>

      {/* Club Header */}
      <Card className="p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            {club.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  <Tag variant="muted">{club.category}</Tag>
                  <Tag variant={club.is_open ? "primary" : "secondary"}>
                    {club.is_open ? "Open Membership" : "Approval Required"}
                  </Tag>
                  {pendingMembers.length > 0 && isAdmin && (
                    <Tag variant="secondary">{pendingMembers.length} pending</Tag>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!isAdmin && (
                  isApprovedMember ? (
                    <Button variant="outline" onClick={handleLeave} disabled={isJoining}>
                      {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserMinus className="w-4 h-4" /> Leave</>}
                    </Button>
                  ) : !isClubMember ? (
                    <Button onClick={handleJoin} disabled={isJoining}>
                      {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Join</>}
                    </Button>
                  ) : (
                    <Tag variant="muted">Pending approval</Tag>
                  )
                )}
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{club.description}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{approvedMembers.length} members</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs — only admin sees Manage tab */}
      {isAdmin && (
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "manage"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
            Manage Club
            {pendingMembers.length > 0 && (
              <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                {pendingMembers.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Video */}
            {club.video_url && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Club Introduction</h2>
                </div>
                <video
                  src={club.video_url}
                  controls
                  className="w-full rounded-lg max-h-64 bg-black"
                />
              </Card>
            )}

            {/* Pending requests — admin only */}
            {isAdmin && pendingMembers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Pending Requests
                  <span className="ml-2 px-2 py-0.5 text-sm bg-primary text-white rounded-full">
                    {pendingMembers.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {pendingMembers.map((member) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={member.user_id.slice(0, 2)} size="sm" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.user_id}</p>
                          <p className="text-xs text-muted-foreground">Pending approval</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleMembershipUpdate(member.user_id, "approved")}
                            disabled={updatingMemberId === member.user_id}
                          >
                            {updatingMemberId === member.user_id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <><Check className="w-4 h-4" /> Approve</>
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMembershipUpdate(member.user_id, "rejected")}
                            disabled={updatingMemberId === member.user_id}
                          >
                            <X className="w-4 h-4" /> Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
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
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="font-bold mb-4">Members ({approvedMembers.length})</h3>
              <div className="space-y-3">
                {approvedMembers.slice(0, 8).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar name={member.user_id.slice(0, 2)} size="sm" />
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
      )}

      {/* MANAGE TAB — admin only */}
      {activeTab === "manage" && isAdmin && (
        <div className="space-y-8">

          {/* Edit Club Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Club Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Club Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_open"
                  checked={editForm.is_open}
                  onChange={(e) => setEditForm({ ...editForm, is_open: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_open" className="text-sm">Open membership (anyone can join instantly)</label>
              </div>
              <Button onClick={handleSaveClub} disabled={isSavingClub}>
                {isSavingClub ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </Card>

          {/* Video Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Video className="w-5 h-5" /> Introduction Video
            </h2>
            {club.video_url ? (
              <div className="space-y-4">
                <video
                  src={club.video_url}
                  controls
                  className="w-full rounded-lg max-h-64 bg-black"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploadingVideo}
                  >
                    {isUploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Replace Video</>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteVideo}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Video
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => videoInputRef.current?.click()}
              >
                {isUploadingVideo ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Uploading video...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Video className="w-10 h-10 text-muted-foreground" />
                    <p className="font-medium">Upload introduction video</p>
                    <p className="text-sm text-muted-foreground">MP4, WebM up to 100MB</p>
                    <Button>
                      <Upload className="w-4 h-4" /> Choose Video
                    </Button>
                  </div>
                )}
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </Card>

          {/* Pending Requests */}
          {pendingMembers.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Pending Requests ({pendingMembers.length})
              </h2>
              <div className="space-y-3">
                {pendingMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <Avatar name={member.user_id.slice(0, 2)} size="sm" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.user_id}</p>
                      <p className="text-xs text-muted-foreground">Wants to join</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleMembershipUpdate(member.user_id, "approved")}
                        disabled={updatingMemberId === member.user_id}
                      >
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMembershipUpdate(member.user_id, "rejected")}
                        disabled={updatingMemberId === member.user_id}
                      >
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Member Management */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Member Management ({approvedMembers.length})
            </h2>
            <div className="space-y-3">
              {approvedMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <Avatar name={member.user_id.slice(0, 2)} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.user_id.slice(0, 16)}...</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleUpdate(member.user_id, e.target.value)}
                      disabled={updatingMemberId === member.user_id || member.user_id === club.admin_user_id}
                      className="text-xs px-2 py-1 bg-card border border-border rounded-lg focus:outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="president">President</option>
                    </select>
                    {member.user_id !== club.admin_user_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveMember(member.user_id)}
                        disabled={updatingMemberId === member.user_id}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                      >
                        {updatingMemberId === member.user_id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Trash2 className="w-3 h-3" />
                        }
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
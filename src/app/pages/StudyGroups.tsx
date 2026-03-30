import { useState, useEffect, useRef } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { Search, Users, MessageSquare, FileText, Send, Upload, Plus, X, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { getStoredToken } from "../context/AuthContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface StudyGroup {
  id: string;
  course_name: string;
  course_code: string;
  description?: string;
  creator_id: string;
  is_active: boolean;
}

interface Message {
  id: string;
  group_id: string;
  sender_id: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

export function StudyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createForm, setCreateForm] = useState({
    course_name: "",
    course_code: "",
    description: "",
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    fetchMessages(selectedGroup.id);

    const channel = supabase
      .channel(`study-group-${selectedGroup.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "study_messages", filter: `group_id=eq.${selectedGroup.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchGroups() {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/study-groups/");
      setGroups(data);
    } catch {
      console.error("Failed to load study groups");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMessages(groupId: string) {
    try {
      const data = await apiFetch(`/api/study-groups/${groupId}/messages`);
      setMessages(data);
    } catch {
      console.error("Failed to load messages");
    }
  }

  async function handleCreate() {
    try {
      setIsSubmitting(true);
      const data = await apiFetch("/api/study-groups/", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      setGroups((prev) => [data, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ course_name: "", course_code: "", description: "" });
      setSelectedGroup(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleJoin(groupId: string) {
    try {
      await apiFetch(`/api/study-groups/${groupId}/join`, { method: "POST" });
      fetchGroups();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to join group");
    }
  }

  async function handleSendMessage() {
    if (!messageText.trim() || !selectedGroup) return;
    try {
      setIsSending(true);
      await apiFetch(`/api/study-groups/${selectedGroup.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageText }),
      });
      setMessageText("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedGroup) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = getStoredToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/study-groups/${selectedGroup.id}/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");
      const { file_url, file_name } = await response.json();

      await apiFetch(`/api/study-groups/${selectedGroup.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ file_url, file_name }),
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const filtered = groups.filter((g) =>
    g.course_name.toLowerCase().includes(search.toLowerCase()) ||
    g.course_code.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
          <p className="text-muted-foreground">Collaborate with classmates and share study materials</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search study groups by course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Groups list */}
        <div className="lg:col-span-1">
          <Card className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No groups found.</div>
            ) : (
              filtered.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-4 cursor-pointer transition-colors ${selectedGroup?.id === group.id ? "bg-primary/5" : "hover:bg-muted"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Tag variant="primary" className="text-xs">{group.course_code}</Tag>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{group.course_name}</h3>
                  {group.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{group.description}</p>
                  )}
                  {group.creator_id !== user?.user_id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoin(group.id); }}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      + Join
                    </button>
                  )}
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3">
          {!selectedGroup ? (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a study group to start chatting</p>
              </div>
            </Card>
          ) : (
            <Card className="h-[580px] flex flex-col">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold">{selectedGroup.course_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedGroup.course_code}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender_id === user?.user_id ? "flex-row-reverse" : ""}`}
                    >
                      {message.sender_id !== user?.user_id && (
                        <Avatar name={message.sender_id.slice(0, 2)} size="sm" />
                      )}
                      <div className={`flex-1 max-w-md ${message.sender_id === user?.user_id ? "flex flex-col items-end" : ""}`}>
                        <div className={`p-3 rounded-lg ${message.sender_id === user?.user_id ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                          {message.content && <p className="text-sm">{message.content}</p>}
                          {message.file_url && (
                            <a
                              href={message.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm underline"
                            >
                              <FileText className="w-4 h-4" />
                              {message.file_name || "Download file"}
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-muted rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors text-sm"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                  <Button onClick={handleSendMessage} disabled={isSending || !messageText.trim()}>
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Study Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Course Name</label>
                <input
                  value={createForm.course_name}
                  onChange={(e) => setCreateForm({ ...createForm, course_name: e.target.value })}
                  placeholder="e.g. Data Structures"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Course Code</label>
                <input
                  value={createForm.course_code}
                  onChange={(e) => setCreateForm({ ...createForm, course_code: e.target.value })}
                  placeholder="e.g. CS301"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="What will this group focus on?"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !createForm.course_name || !createForm.course_code}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Group"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

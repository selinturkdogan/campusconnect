import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Avatar } from "../components/Avatar";
import { Search, Users, MessageSquare, FileText, Send, Upload } from "lucide-react";
import { useState } from "react";

export function StudyGroups() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(1);

  const studyGroups = [
    {
      id: 1,
      course: "CS 401",
      name: "Advanced Algorithms Study Group",
      members: 8,
      lastActive: "5 min ago",
      unread: 3,
    },
    {
      id: 2,
      course: "CS 445",
      name: "Machine Learning Study Group",
      members: 12,
      lastActive: "1 hour ago",
      unread: 0,
    },
    {
      id: 3,
      course: "CS 420",
      name: "Database Systems Study Group",
      members: 6,
      lastActive: "3 hours ago",
      unread: 1,
    },
    {
      id: 4,
      course: "CS 350",
      name: "Software Engineering Group",
      members: 10,
      lastActive: "1 day ago",
      unread: 0,
    },
  ];

  const messages = [
    {
      id: 1,
      author: "Sarah Chen",
      content: "Hey everyone! I found a great resource for understanding dynamic programming. Let me share it with you.",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      author: "You",
      content: "Thanks Sarah! That would be really helpful. I'm still struggling with the knapsack problem.",
      time: "10:32 AM",
      isOwn: true,
    },
    {
      id: 3,
      author: "Mike Johnson",
      content: "Same here! Are we still meeting tomorrow at the library?",
      time: "10:35 AM",
      isOwn: false,
    },
    {
      id: 4,
      author: "Sarah Chen",
      content: "Yes! Tomorrow at 3 PM, study room B on the 2nd floor.",
      time: "10:38 AM",
      isOwn: false,
    },
  ];

  const sharedFiles = [
    {
      id: 1,
      name: "Dynamic Programming Notes.pdf",
      uploadedBy: "Sarah Chen",
      uploadedAt: "2 hours ago",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Practice Problems - Week 5.pdf",
      uploadedBy: "Mike Johnson",
      uploadedAt: "1 day ago",
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Lecture Summary - Graphs.docx",
      uploadedBy: "Emily Davis",
      uploadedAt: "2 days ago",
      size: "856 KB",
    },
  ];

  const currentGroup = studyGroups.find((g) => g.id === selectedGroup);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
        <p className="text-muted-foreground">
          Collaborate with classmates and share study materials
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search study groups by course..."
          className="w-full pl-10 pr-4 py-3 bg-card rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Study Groups List */}
        <div className="lg:col-span-1">
          <Card className="divide-y divide-border">
            {studyGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedGroup === group.id ? "bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag variant="primary" className="text-xs">{group.course}</Tag>
                      {group.unread > 0 && (
                        <span className="w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                          {group.unread}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{group.members} members</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{group.lastActive}</p>
              </div>
            ))}
          </Card>
          <Button className="w-full mt-4">Create New Group</Button>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{currentGroup?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentGroup?.members} members
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4" />
                  View Members
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}
                >
                  {!message.isOwn && <Avatar name={message.author} size="sm" />}
                  <div
                    className={`flex-1 max-w-md ${
                      message.isOwn ? "flex flex-col items-end" : ""
                    }`}
                  >
                    {!message.isOwn && (
                      <p className="text-sm font-medium mb-1">{message.author}</p>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        message.isOwn
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-muted rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors"
                />
                <Button>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Files Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold">Shared Files</h3>
              </div>
            </div>

            <Button variant="outline" className="w-full mb-4">
              <Upload className="w-4 h-4" />
              Upload File
            </Button>

            <div className="space-y-3">
              {sharedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {file.uploadedBy} • {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Group Info */}
          <Card className="p-4 mt-4">
            <h3 className="font-bold mb-3">Group Members</h3>
            <div className="space-y-3">
              {["Sarah Chen", "Mike Johnson", "Emily Davis", "Alex Kim", "You"].map(
                (member) => (
                  <div key={member} className="flex items-center gap-2">
                    <Avatar name={member} size="sm" />
                    <span className="text-sm">{member}</span>
                  </div>
                )
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

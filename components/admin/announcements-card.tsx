"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Plus,
  Trash2, 
  Megaphone,
  AlertTriangle,
  Info,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { 
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  type Announcement 
} from "@/actions/admin";

interface AnnouncementsCardProps {
  initialAnnouncements: Announcement[];
}

const priorityConfig = {
  low: { icon: Info, color: "bg-blue-500/10 text-blue-500", label: "Low" },
  normal: { icon: AlertCircle, color: "bg-yellow-500/10 text-yellow-500", label: "Normal" },
  high: { icon: AlertTriangle, color: "bg-red-500/10 text-red-500", label: "High" },
};

export function AnnouncementsCard({ initialAnnouncements }: AnnouncementsCardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchAnnouncements = () => {
    startTransition(async () => {
      const data = await getAnnouncements();
      setAnnouncements(data);
    });
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    const result = await createAnnouncement({
      title,
      content,
      priority,
      expires_at: expiresAt || undefined,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setDialogOpen(false);
      setTitle("");
      setContent("");
      setPriority("normal");
      setExpiresAt("");
      fetchAnnouncements();
    }
  };

  const handleToggle = async (announcement: Announcement) => {
    const result = await toggleAnnouncement(announcement.id, !announcement.is_active);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchAnnouncements();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;
    
    const result = await deleteAnnouncement(announcementToDelete.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchAnnouncements();
    }
    setDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement that will be visible to all users.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Announcement content..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires">Expires At (Optional)</Label>
                    <Input
                      id="expires"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isPending}>
                  {isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No announcements yet</p>
              <p className="text-sm">Create your first announcement to notify users.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const PriorityIcon = priorityConfig[announcement.priority].icon;
                return (
                  <div 
                    key={announcement.id} 
                    className={`p-4 rounded-lg border ${!announcement.is_active ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={priorityConfig[announcement.priority].color}
                          >
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {priorityConfig[announcement.priority].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(announcement.created_at).toLocaleDateString()}
                          {announcement.expires_at && (
                            <> · Expires: {new Date(announcement.expires_at).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${announcement.id}`} className="text-xs">
                            Active
                          </Label>
                          <Switch
                            id={`active-${announcement.id}`}
                            checked={announcement.is_active}
                            onCheckedChange={() => handleToggle(announcement)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setAnnouncementToDelete(announcement);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

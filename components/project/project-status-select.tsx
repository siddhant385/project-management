"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProjectStatus } from "@/actions/project";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type ProjectStatus = "draft" | "open" | "in_progress" | "completed" | "archived";

interface ProjectStatusSelectProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onSuccess?: () => void;
}

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Draft",
  open: "Open for Applications",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
};

const statusColors: Record<ProjectStatus, string> = {
  draft: "text-muted-foreground",
  open: "text-green-600",
  in_progress: "text-blue-600",
  completed: "text-purple-600",
  archived: "text-gray-600",
};

export function ProjectStatusSelect({ 
  projectId, 
  currentStatus, 
  onSuccess 
}: ProjectStatusSelectProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  async function handleStatusChange(newStatus: ProjectStatus) {
    if (newStatus === status) return;

    setLoading(true);
    try {
      await updateProjectStatus(projectId, newStatus);
      setStatus(newStatus);
      toast.success(`Project status updated to "${statusLabels[newStatus]}"`);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
        <SelectTrigger className="w-[180px]" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <SelectValue>
              <span className={statusColors[status]}>{statusLabels[status]}</span>
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft" className={statusColors.draft}>
            {statusLabels.draft}
          </SelectItem>
          <SelectItem value="open" className={statusColors.open}>
            {statusLabels.open}
          </SelectItem>
          <SelectItem value="in_progress" className={statusColors.in_progress}>
            {statusLabels.in_progress}
          </SelectItem>
          <SelectItem value="completed" className={statusColors.completed}>
            {statusLabels.completed}
          </SelectItem>
          <SelectItem value="archived" className={statusColors.archived}>
            {statusLabels.archived}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

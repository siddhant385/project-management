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
// open, mentor_assigned, in_progress, submitted, evaluated, rejected
type ProjectStatus = "open" | "mentor_assigned" | "in_progress" | "submitted" | "evaluated" | "rejected";

interface ProjectStatusSelectProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onSuccess?: () => void;
}

const statusLabels: Record<ProjectStatus, string> = {
  
  open: "Open for Applications",
  mentor_assigned: "Mentor Assigned",
  in_progress: "In Progress",
  evaluated: "Evaluated",
  rejected: "Rejected",
  submitted: "Submitted"

};

const statusColors: Record<ProjectStatus, string> = {
  submitted: "text-muted-foreground",
  mentor_assigned: "text-orange-600",
  open: "text-green-600",
  in_progress: "text-blue-600",
  evaluated: "text-purple-600",
  rejected: "text-red-600"
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
          <SelectItem value="submitted" className={statusColors.submitted}>
            {statusLabels.submitted}
          </SelectItem>
          <SelectItem value="mentor_assigned" className={statusColors.mentor_assigned}>
            {statusLabels.mentor_assigned}
          </SelectItem>
          <SelectItem value="open" className={statusColors.open}>
            {statusLabels.open}
          </SelectItem>
          <SelectItem value="in_progress" className={statusColors.in_progress}>
            {statusLabels.in_progress}
          </SelectItem>
          <SelectItem value="evaluated" className={statusColors.evaluated}>
            {statusLabels.evaluated}
          </SelectItem>
          <SelectItem value="rejected" className={statusColors.rejected}>
            {statusLabels.rejected}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

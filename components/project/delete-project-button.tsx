"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteProject } from "@/actions/project";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteProjectButtonProps {
  projectId: string;
  projectTitle: string;
}

export function DeleteProjectButton({ projectId, projectTitle }: DeleteProjectButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteProject(projectId);
      toast.success("Project deleted successfully");
      // Redirect happens in the action
    } catch (error) {
      toast.error("Failed to delete project");
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>"{projectTitle}"</strong>? 
            This action cannot be undone. All project data, files, and applications will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Yes, Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

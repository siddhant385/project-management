"use client";

import { useState } from "react";
import { toast } from "sonner";
import { rejectApplication } from "@/actions/project";
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
import { X } from "lucide-react";

interface RejectApplicationButtonProps {
  applicationId: string;
  applicantName: string;
  projectId: string;
  onSuccess?: () => void;
}

export function RejectApplicationButton({ 
  applicationId, 
  applicantName,
  projectId,
  onSuccess 
}: RejectApplicationButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleReject() {
    setLoading(true);
    try {
      await rejectApplication(applicationId, projectId);
      toast.success("Application rejected");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to reject application");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <X className="mr-2 h-4 w-4" /> Reject
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Application?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject the application from <strong>{applicantName}</strong>?
            They will be notified of this decision.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleReject}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Rejecting..." : "Yes, Reject"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

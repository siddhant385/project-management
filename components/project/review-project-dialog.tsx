"use client";

import { useState } from "react";
import { toast } from "sonner";
import { reviewProject } from "@/actions/project";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewProjectDialogProps {
  projectId: string;
  projectTitle: string;
  existingReview?: {
    rating: number;
    comments: string;
  } | null;
  onSuccess?: () => void;
}

export function ReviewProjectDialog({ 
  projectId, 
  projectTitle, 
  existingReview,
  onSuccess 
}: ReviewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState(existingReview?.comments || "");

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('rating', rating.toString());
      formData.append('comments', comments);
      
      await reviewProject(projectId, formData);
      toast.success(existingReview ? "Review updated!" : "Review submitted!");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingReview ? "outline" : "default"} size="sm">
          <Star className="mr-2 h-4 w-4" /> 
          {existingReview ? "Edit Review" : "Review Project"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingReview ? "Edit Review" : "Review Project"}</DialogTitle>
          <DialogDescription>
            Provide your rating and feedback for "{projectTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Needs Improvement"}
              {rating === 2 && "Below Average"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide detailed feedback on the project..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

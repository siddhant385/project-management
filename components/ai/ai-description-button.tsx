"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateProjectDescription } from "@/actions/ai";
import { toast } from "sonner";

interface AIDescriptionButtonProps {
  title: string;
  tags: string;
  onGenerated: (description: string) => void;
}

export function AIDescriptionButton({ title, tags, onGenerated }: AIDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a project title first");
      return;
    }

    setIsGenerating(true);
    
    try {
      const skills = tags.split(",").map(t => t.trim()).filter(Boolean);
      const result = await generateProjectDescription(
        title,
        skills.length > 0 ? skills : ["General"],
        "Academic", // Default category
        "Intermediate" // Default difficulty
      );

      if (result.error) {
        toast.error(result.error);
      } else if (result.description) {
        onGenerated(result.description);
        toast.success("Description generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate description");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="gap-2 text-xs"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3 text-violet-500" />
          AI Generate
        </>
      )}
    </Button>
  );
}

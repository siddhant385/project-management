"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Plus, Calendar } from "lucide-react";
import { generateMilestoneSuggestions, type SuggestedMilestone } from "@/actions/ai";
import { createMilestone } from "@/actions/milestones"; // Import create action
import { toast } from "sonner";

interface AIMilestoneSuggestionsProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  existingMilestones: string[]; // List of titles to avoid duplicates
}

export function AIMilestoneSuggestions({
  projectId,
  projectTitle,
  projectDescription,
  existingMilestones,
}: AIMilestoneSuggestionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedMilestone[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSuggestions([]);
    setSelectedIndices(new Set());
    
    try {
      const result = await generateMilestoneSuggestions(
        projectTitle,
        projectDescription,
        existingMilestones,
        4 // Generate 4 milestones
      );

      if (result.error) {
        toast.error(result.error);
      } else if (result.milestones) {
        setSuggestions(result.milestones);
        setShowSuggestions(true);
        // Select all by default
        setSelectedIndices(new Set(result.milestones.map((_, i) => i)));
        toast.success("Milestones generated!");
      }
    } catch (error) {
      toast.error("Failed to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const handleAddSelected = async () => {
    const milestonesToAdd = suggestions.filter((_, i) => selectedIndices.has(i));
    
    if (milestonesToAdd.length === 0) {
      toast.error("Please select at least one milestone");
      return;
    }

    setIsSaving(true);
    let addedCount = 0;

    // Loop through selected and create them using Server Action
    // Realtime listener will automatically update the UI
    for (const m of milestonesToAdd) {
      try {
        // Calculate Due Date: Today + Estimated Days
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + m.estimatedDaysFromNow);

        await createMilestone({
          project_id: projectId,
          title: m.title,
          description: m.description,
          due_date: dueDate.toISOString(),
          assigned_to: "unassigned" // Default unassigned
        });
        addedCount++;
      } catch (error) {
        console.error("Failed to create milestone:", m.title);
      }
    }

    toast.success(`${addedCount} milestones added successfully!`);
    setIsSaving(false);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  if (!showSuggestions) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating Plan...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI Create Timeline
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="border-violet-500/20 bg-violet-500/5 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Suggested Timeline
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSuggestions(false);
              setSuggestions([]);
            }}
          >
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              selectedIndices.has(index)
                ? "bg-background border-violet-500/30"
                : "bg-muted/30 border-transparent"
            }`}
            onClick={() => toggleSelection(index)}
          >
            <Checkbox
              checked={selectedIndices.has(index)}
              onCheckedChange={() => toggleSelection(index)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{item.title}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 bg-background px-2 py-0.5 rounded border">
                  <Calendar className="h-3 w-3" />
                  Day {item.estimatedDaysFromNow}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-muted-foreground">
            {selectedIndices.size} selected
          </span>
          <Button 
            onClick={handleAddSelected} 
            size="sm" 
            className="gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add to Timeline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
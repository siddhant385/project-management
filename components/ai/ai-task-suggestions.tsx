"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Plus, Clock, AlertCircle } from "lucide-react";
import { generateTaskSuggestions, type SuggestedTask } from "@/actions/ai";
import { toast } from "sonner";

interface AITaskSuggestionsProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  existingTasks: string[];
  onAddTasks: (tasks: Array<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
  }>) => void;
}

const priorityColors = {
  low: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function AITaskSuggestions({
  projectId,
  projectTitle,
  projectDescription,
  existingTasks,
  onAddTasks,
}: AITaskSuggestionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSuggestions([]);
    setSelectedTasks(new Set());
    
    try {
      const result = await generateTaskSuggestions(
        projectTitle,
        projectDescription,
        existingTasks,
        5
      );

      if (result.error) {
        toast.error(result.error);
      } else if (result.tasks) {
        setSuggestions(result.tasks);
        setShowSuggestions(true);
        // Select all by default
        setSelectedTasks(new Set(result.tasks.map((_, i) => i)));
        toast.success("Task suggestions generated!");
      }
    } catch (error) {
      toast.error("Failed to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleAddSelected = () => {
    const tasksToAdd = suggestions
      .filter((_, i) => selectedTasks.has(i))
      .map(task => ({
        title: task.title,
        description: task.description,
        priority: task.priority,
      }));
    
    if (tasksToAdd.length === 0) {
      toast.error("Please select at least one task");
      return;
    }
    
    onAddTasks(tasksToAdd);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedTasks(new Set());
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
            Generating suggestions...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI Suggest Tasks
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="border-violet-500/20 bg-violet-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI Suggested Tasks
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
        {suggestions.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-4 w-4 mr-2" />
            No suggestions available
          </div>
        ) : (
          <>
            {suggestions.map((task, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedTasks.has(index)
                    ? "bg-background border-violet-500/30"
                    : "bg-muted/30 border-transparent"
                }`}
                onClick={() => toggleTask(index)}
              >
                <Checkbox
                  checked={selectedTasks.has(index)}
                  onCheckedChange={() => toggleTask(index)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{task.title}</span>
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{task.estimatedDays} days
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">
                {selectedTasks.size} of {suggestions.length} selected
              </span>
              <Button onClick={handleAddSelected} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Selected Tasks
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

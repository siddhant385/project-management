"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Plus, Clock, AlertCircle } from "lucide-react";
import { generateTaskSuggestions, type SuggestedTask } from "@/actions/ai";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AITaskSuggestionsProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  existingTasks: string[];
  milestones: Array<{ id: string; title: string; description: string | null }>;
  onAddTasks: (tasks: any[]) => void;
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
  milestones,
  onAddTasks,
}: AITaskSuggestionsProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"config" | "preview">("config");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("all");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSuggestions([]);
    setSelectedTasks(new Set());
    
    try {
      let milestoneContext = null;
      if (selectedMilestoneId && selectedMilestoneId !== "all") {
        const m = milestones.find((m) => m.id === selectedMilestoneId);
        if (m) {
          milestoneContext = { title: m.title, description: m.description || "" };
        }
      }

      const result = await generateTaskSuggestions(
        projectTitle,
        projectDescription,
        existingTasks,
        5,
        milestoneContext
      );

      if (result.error) {
        toast.error(result.error);
      } else if (result.tasks) {
        setSuggestions(result.tasks);
        setSelectedTasks(new Set(result.tasks.map((_, i) => i)));
        setStep("preview");
      }
    } catch (error) {
      toast.error("Failed to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("config");
      setSuggestions([]);
      setSelectedMilestoneId("all");
    }, 300);
  };

  const toggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) newSelected.delete(index);
    else newSelected.add(index);
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
      toast.error("Select at least one task");
      return;
    }
    
    onAddTasks(tasksToAdd);
    handleReset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          AI Suggest
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            {step === "config" ? "AI Task Generator" : "Review Suggestions"}
          </DialogTitle>
          <DialogDescription>
            {step === "config" 
              ? "Select a milestone context or generate for the whole project." 
              : "Select tasks to add to your board."}
          </DialogDescription>
        </DialogHeader>

        {step === "config" && (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Context Scope</Label>
              <Select value={selectedMilestoneId} onValueChange={setSelectedMilestoneId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select context..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Whole Project</SelectItem>
                  {milestones.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      Milestone: {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>AI will analyze your project description {selectedMilestoneId !== 'all' ? 'and the selected milestone' : ''} to suggest actionable tasks.</p>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {suggestions.map((task, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedTasks.has(index) ? "bg-violet-500/5 border-violet-500/30" : "bg-background hover:bg-muted/50"}`} onClick={() => toggleTask(index)}>
                <Checkbox checked={selectedTasks.has(index)} onCheckedChange={() => toggleTask(index)} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{task.title}</span>
                    <Badge variant="outline" className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>~{task.estimatedDays} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="flex justify-between w-full">
          {step === "preview" ? (
            <>
              <Button variant="ghost" onClick={() => setStep("config")}>Back</Button>
              <Button onClick={handleAddSelected}><Plus className="h-4 w-4 mr-2" />Add Tasks</Button>
            </>
          ) : (
            <div className="flex w-full justify-end">
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : "Generate"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
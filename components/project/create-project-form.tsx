"use client";

import { useState } from "react";
import { createProject } from "@/actions/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Rocket, ArrowLeft, Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { AIDescriptionButton } from "@/components/ai";
import { toast } from "sonner";

export function CreateProjectForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tags);

      await createProject(formData);
      // createProject redirects on success, so this won't execute
      toast.success("Project created successfully!");
    } catch (error) {
      toast.error("Failed to create project");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-2xl mx-auto py-6 md:py-10 px-4">
        {/* Back Button */}
        <Link
          href="/student"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl">
                  Create New Project
                </CardTitle>
                <CardDescription className="text-sm">
                  Share your idea, find a team, and get mentored
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Project Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Smart Traffic Management System"
                  required
                  className="h-11"
                />
              </div>

              {/* 2. Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <AIDescriptionButton
                    title={title}
                    tags={tags}
                    onGenerated={setDescription}
                  />
                </div>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem you are solving and your proposed solution..."
                  className="min-h-[120px] md:min-h-[150px] resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about the problem, your approach, and expected
                  outcomes.
                </p>
              </div>

              {/* 3. Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags / Tech Stack
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. React, Python, Machine Learning"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Separate keywords with commas. This helps mentors find your
                  project.
                </p>
              </div>

              {/* Tips Card */}
              <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Tips for a great project
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>
                    Choose a problem that you&apos;re passionate about solving
                  </li>
                  <li>Be clear about the scope - start small, then expand</li>
                  <li>
                    Add relevant tech stack tags to attract the right mentor
                  </li>
                  <li>
                    Use <strong>AI Generate</strong> to create a professional description
                  </li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  asChild
                  className="w-full sm:w-auto"
                >
                  <Link href="/student">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

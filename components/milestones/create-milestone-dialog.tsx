"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createMilestone, updateMilestone, Milestone } from "@/actions/milestones";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  assigned_to: z.string().optional(),
});

type MilestoneForm = z.infer<typeof milestoneSchema>;

interface CreateMilestoneDialogProps {
  projectId: string;
  members: Array<{
    user_id: string;
    profile: { id: string; full_name: string; avatar_url: string | null };
  }>;
  editMilestone?: Milestone;
  open?: boolean;
  onClose?: () => void;
}

export function CreateMilestoneDialog({
  projectId,
  members,
  editMilestone,
  open,
  onClose,
}: CreateMilestoneDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<MilestoneForm>({
    resolver: zodResolver(milestoneSchema) as any,
    defaultValues: {
      title: editMilestone?.title || "",
      description: editMilestone?.description || "",
      due_date: editMilestone?.due_date
        ? new Date(editMilestone.due_date).toISOString().split("T")[0]
        : "",
      assigned_to: editMilestone?.assigned_to || "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (open !== undefined) {
      if (!newOpen) onClose?.();
    } else {
      setIsOpen(newOpen);
      if (!newOpen) form.reset();
    }
  };

  const onSubmit = async (data: MilestoneForm) => {
    setLoading(true);
    try {
      if (editMilestone) {
        await updateMilestone(editMilestone.id, {
          title: data.title,
          description: data.description || null,
          due_date: data.due_date,
          assigned_to: data.assigned_to || null,
        });
        toast.success("Milestone updated successfully");
      } else {
        await createMilestone({
          project_id: projectId,
          title: data.title,
          description: data.description || null,
          due_date: data.due_date,
          assigned_to: data.assigned_to || null,
        });
        toast.success("Milestone created successfully");
      }
      handleOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(`Failed to ${editMilestone ? "update" : "create"} milestone`);
    } finally {
      setLoading(false);
    }
  };

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editMilestone ? "Edit Milestone" : "Create Milestone"}
          </DialogTitle>
          <DialogDescription>
            {editMilestone
              ? "Update the milestone details below."
              : "Add a new milestone to track project progress."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter milestone title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what needs to be accomplished..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "unassigned"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {members.map((member) => (
                          <SelectItem
                            key={member.user_id}
                            value={member.user_id}
                          >
                            {member.profile.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? editMilestone
                    ? "Updating..."
                    : "Creating..."
                  : editMilestone
                  ? "Update Milestone"
                  : "Create Milestone"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

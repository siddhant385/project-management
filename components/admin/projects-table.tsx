"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  MoreHorizontal, 
  Star,
  StarOff,
  Trash2, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { 
  getAllProjects, 
  toggleProjectFeatured,
  changeProjectStatus,
  deleteProject,
  type AdminProject 
} from "@/actions/admin";

interface ProjectsTableProps {
  initialProjects: AdminProject[];
  initialTotal: number;
}

const statusBadgeColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  approved: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-purple-500/10 text-purple-500",
  completed: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function ProjectsTable({ initialProjects, initialTotal }: ProjectsTableProps) {
  const [projects, setProjects] = useState<AdminProject[]>(initialProjects);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<AdminProject | null>(null);

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const fetchProjects = (newPage?: number, status?: string, search?: string) => {
    startTransition(async () => {
      const result = await getAllProjects(
        newPage || page,
        limit,
        status === "all" ? undefined : status,
        search || undefined
      );
      setProjects(result.projects);
      setTotal(result.total);
    });
  };

  const handleSearch = () => {
    setPage(1);
    fetchProjects(1, statusFilter, searchQuery);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    fetchProjects(1, value, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchProjects(newPage, statusFilter, searchQuery);
  };

  const handleToggleFeatured = async (project: AdminProject) => {
    const result = await toggleProjectFeatured(project.id, !project.is_featured);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchProjects(page, statusFilter, searchQuery);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    const result = await changeProjectStatus(projectId, newStatus);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchProjects(page, statusFilter, searchQuery);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    const result = await deleteProject(projectToDelete.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchProjects(page, statusFilter, searchQuery);
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Project Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by project title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isPending}>
              {isPending ? "Loading..." : "Search"}
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left font-medium">Project</th>
                    <th className="h-12 px-4 text-left font-medium hidden md:table-cell">Initiator</th>
                    <th className="h-12 px-4 text-left font-medium">Status</th>
                    <th className="h-12 px-4 text-left font-medium hidden lg:table-cell">Created</th>
                    <th className="h-12 px-4 text-left font-medium">Featured</th>
                    <th className="h-12 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="h-24 text-center text-muted-foreground">
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium line-clamp-1">{project.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {project.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <p className="text-sm">{project.initiator?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{project.initiator?.email}</p>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="secondary" 
                            className={statusBadgeColors[project.status] || ""}
                          >
                            <span className="capitalize">{project.status.replace("_", " ")}</span>
                          </Badge>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-muted-foreground">
                          {new Date(project.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {project.is_featured ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/projects/${project.id}`} className="flex items-center">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Project
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(project)}>
                                {project.is_featured ? (
                                  <>
                                    <StarOff className="h-4 w-4 mr-2" />
                                    Remove Featured
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Mark Featured
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Change Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {statusOptions.map((status) => (
                                    <DropdownMenuItem 
                                      key={status.value}
                                      onClick={() => handleStatusChange(project.id, status.value)}
                                      disabled={project.status === status.value}
                                    >
                                      {status.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setProjectToDelete(project);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} projects
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || isPending}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || isPending}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{projectToDelete?.title}</strong>? 
              This will also delete all associated tasks and milestones. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

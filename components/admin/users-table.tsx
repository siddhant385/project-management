"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  UserCog, 
  Ban, 
  Trash2, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { 
  getAllUsers, 
  toggleUserBan, 
  deleteUser,
  type AdminUser, 
  type UserRole,
} from "@/actions/admin";
import { DEPARTMENTS, type Department } from "@/lib/constants";
import { RoleChangeDialog } from "./role-change-dialog";

interface UsersTableProps {
  initialUsers: AdminUser[];
  initialTotal: number;
}

const roleIcons: Record<UserRole, React.ReactNode> = {
  student: <GraduationCap className="h-3 w-3" />,
  mentor: <UserCheck className="h-3 w-3" />,
  admin: <ShieldCheck className="h-3 w-3" />,
};

const roleBadgeColors: Record<UserRole, string> = {
  student: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  mentor: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  admin: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export function UsersTable({ initialUsers, initialTotal }: UsersTableProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  
  // Role change dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const fetchUsers = (newPage?: number, role?: UserRole | "all", search?: string, dept?: Department | "all") => {
    startTransition(async () => {
      const result = await getAllUsers(
        newPage || page,
        limit,
        role === "all" ? undefined : role,
        search || undefined,
        dept === "all" ? undefined : dept
      );
      setUsers(result.users);
      setTotal(result.total);
    });
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, roleFilter, searchQuery, departmentFilter);
  };

  const handleRoleFilter = (value: string) => {
    const role = value as UserRole | "all";
    setRoleFilter(role);
    setPage(1);
    fetchUsers(1, role, searchQuery, departmentFilter);
  };

  const handleDepartmentFilter = (value: string) => {
    const dept = value as Department | "all";
    setDepartmentFilter(dept);
    setPage(1);
    fetchUsers(1, roleFilter, searchQuery, dept);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsers(newPage, roleFilter, searchQuery, departmentFilter);
  };

  const handleToggleBan = async (user: AdminUser) => {
    const result = await toggleUserBan(user.id, !user.is_banned);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchUsers(page, roleFilter, searchQuery, departmentFilter);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    const result = await deleteUser(userToDelete.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchUsers(page, roleFilter, searchQuery, departmentFilter);
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const openRoleDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const openDeleteDialog = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="mentor">Mentors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={handleDepartmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isPending}>
              {isPending ? "Loading..." : "Search"}
            </Button>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left font-medium">User</th>
                    <th className="h-12 px-4 text-left font-medium">Role</th>
                    <th className="h-12 px-4 text-left font-medium hidden md:table-cell">Department</th>
                    <th className="h-12 px-4 text-left font-medium hidden lg:table-cell">Joined</th>
                    <th className="h-12 px-4 text-left font-medium">Status</th>
                    <th className="h-12 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="h-24 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>
                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name || "No name"}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="secondary" 
                            className={`${roleBadgeColors[user.role]} gap-1`}
                          >
                            {roleIcons[user.role]}
                            <span className="capitalize">{user.role}</span>
                          </Badge>
                        </td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">
                          {user.department || "-"}
                        </td>
                        <td className="p-4 hidden lg:table-cell text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {user.is_banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : user.onboarding_completed ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                              Onboarding
                            </Badge>
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
                              <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                                <UserCog className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleBan(user)}>
                                <Ban className="h-4 w-4 mr-2" />
                                {user.is_banned ? "Unban User" : "Ban User"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(user)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
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
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
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

      {/* Role Change Dialog */}
      <RoleChangeDialog
        user={selectedUser}
        open={roleDialogOpen}
        onOpenChange={(open) => {
          setRoleDialogOpen(open);
          if (!open) {
            fetchUsers(page, roleFilter, searchQuery, departmentFilter);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.full_name || userToDelete?.email}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

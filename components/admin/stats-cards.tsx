"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  FolderKanban, 
  PlayCircle, 
  CheckCircle2, 
  Clock,
  ListTodo,
  TrendingUp
} from "lucide-react";
import type { AdminStats } from "@/actions/admin";

interface StatsCardsProps {
  stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: `+${stats.newUsersThisMonth} this month`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      description: "Registered students",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Mentors",
      value: stats.totalMentors,
      icon: UserCheck,
      description: "Active mentors",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Admins",
      value: stats.totalAdmins,
      icon: ShieldCheck,
      description: "Platform admins",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const projectCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      description: `+${stats.newProjectsThisMonth} this month`,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: PlayCircle,
      description: "In progress",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Completed",
      value: stats.completedProjects,
      icon: CheckCircle2,
      description: "Successfully finished",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Pending",
      value: stats.pendingProjects,
      icon: Clock,
      description: "Awaiting approval",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const taskCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: ListTodo,
      description: "Across all projects",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: TrendingUp,
      description: stats.totalTasks > 0 
        ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate`
        : "No tasks yet",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Users Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Project Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Projects Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {projectCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Task Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Tasks Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {taskCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2,
  GraduationCap,
  UserCheck,
  FolderKanban,
} from "lucide-react";
import type { DepartmentStats } from "@/actions/admin";

interface DepartmentStatsCardProps {
  stats: DepartmentStats[];
}

const departmentColors: Record<string, string> = {
  CSE: "bg-blue-500",
  ECE: "bg-green-500",
  ME: "bg-orange-500",
  CE: "bg-purple-500",
  IT: "bg-cyan-500",
  AIDS: "bg-pink-500",
  EE: "bg-yellow-500",
  MECH: "bg-red-500",
  IP: "bg-indigo-500",
  MATH: "bg-teal-500",
  CHEM: "bg-amber-500",
  PHY: "bg-lime-500",
  "T&P": "bg-rose-500",
};

export function DepartmentStatsCard({ stats }: DepartmentStatsCardProps) {
  const maxTotal = Math.max(...stats.map(d => d.students + d.mentors + d.projects), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Department Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No department data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.map((dept) => {
              const total = dept.students + dept.mentors + dept.projects;
              const percentage = (total / maxTotal) * 100;
              
              return (
                <div key={dept.department} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${departmentColors[dept.department] || 'bg-gray-500'} text-white`}
                      >
                        {dept.department}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {dept.students}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {dept.mentors}
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        {dept.projects}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${departmentColors[dept.department] || 'bg-gray-500'} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground border-t">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> Students
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" /> Mentors
              </span>
              <span className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3" /> Projects
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

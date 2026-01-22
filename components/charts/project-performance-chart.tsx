"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ProjectPerformanceData {
  name: string;
  progress: number;
  tasks_completed: number;
  total_tasks: number;
  milestones_completed: number;
  total_milestones: number;
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[];
}

export function ProjectPerformanceChart({ data }: ProjectPerformanceChartProps) {
  // Colors for bars - using OKLCH compatible colors
  const getBarColor = (progress: number) => {
    if (progress >= 80) return "#22c55e"; // green
    if (progress >= 50) return "#f59e0b"; // amber
    if (progress >= 25) return "#3b82f6"; // blue
    return "#ef4444"; // red
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-medium">{data.progress}%</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tasks:</span>
              <span className="font-medium">{data.tasks_completed}/{data.total_tasks}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Milestones:</span>
              <span className="font-medium">{data.milestones_completed}/{data.total_milestones}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Project Performance
          </CardTitle>
          <CardDescription>
            Progress comparison across all mentored projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No project data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Project Performance
        </CardTitle>
        <CardDescription>
          Progress comparison across all mentored projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true}
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fontSize: 11, fill: 'var(--foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
              <Bar 
                dataKey="progress" 
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.progress)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-muted-foreground">80%+ Excellent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-muted-foreground">50-79% Good</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground">25-49% Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-muted-foreground">&lt;25% Needs Attention</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

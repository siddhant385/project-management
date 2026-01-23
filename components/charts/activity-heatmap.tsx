"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityData {
  date: string; // YYYY-MM-DD format
  count: number;
  activities?: {
    type: string;
    description: string;
  }[];
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  title?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ActivityHeatmap({ data, title = "Activity Heatmap" }: ActivityHeatmapProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  
  // Get the activity level color
  const getActivityColor = (count: number): string => {
    if (count === 0) return "bg-muted hover:bg-muted/80";
    if (count <= 2) return "bg-green-200 dark:bg-green-900 hover:bg-green-300 dark:hover:bg-green-800";
    if (count <= 5) return "bg-green-400 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600";
    if (count <= 10) return "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500";
    return "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400";
  };

  // Generate calendar data for current view
  const calendarData = useMemo(() => {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create activity map for quick lookup
    const activityMap = new Map<string, ActivityData>();
    data.forEach(item => {
      activityMap.set(item.date, item);
    });
    
    // Generate weeks
    const weeks: (ActivityData | null)[][] = [];
    let currentWeek: (ActivityData | null)[] = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const activity = activityMap.get(dateStr) || { date: dateStr, count: 0 };
      
      currentWeek.push(activity);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Add remaining empty cells
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return {
      weeks,
      monthName: MONTHS[month],
      year,
    };
  }, [data, monthOffset]);

  const totalActivities = useMemo(() => {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();
    
    return data
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === year && itemDate.getMonth() === month;
      })
      .reduce((sum, item) => sum + item.count, 0);
  }, [data, monthOffset]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>
              {totalActivities} activities in {calendarData.monthName} {calendarData.year}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setMonthOffset(prev => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-20 text-center">
              {calendarData.monthName} {calendarData.year}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setMonthOffset(prev => Math.min(prev + 1, 0))}
              disabled={monthOffset >= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(day => (
              <div key={day} className="text-[10px] text-muted-foreground text-center font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="space-y-1">
            {calendarData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className="aspect-square">
                    {day ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-full h-full rounded-sm cursor-pointer transition-colors ${getActivityColor(day.count)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <div className="text-xs">
                            <p className="font-semibold">
                              {new Date(day.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-muted-foreground">
                              {day.count} {day.count === 1 ? 'activity' : 'activities'}
                            </p>
                            {day.activities && day.activities.length > 0 && (
                              <div className="mt-1 pt-1 border-t border-border">
                                {day.activities.slice(0, 3).map((a, i) => (
                                  <p key={i} className="truncate text-muted-foreground">
                                    • {a.description}
                                  </p>
                                ))}
                                {day.activities.length > 3 && (
                                  <p className="text-muted-foreground">
                                    +{day.activities.length - 3} more
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
            <span>More</span>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

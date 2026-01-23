"use client";

import { useState, useEffect } from "react";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PublicAnnouncement } from "@/actions/announcements";

interface AnnouncementsBannerProps {
  announcements: PublicAnnouncement[];
}

const typeConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-500/10 border-blue-500/20",
    textColor: "text-blue-600 dark:text-blue-400",
    badgeColor: "bg-blue-500/20 text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    textColor: "text-yellow-600 dark:text-yellow-400",
    badgeColor: "bg-yellow-500/20 text-yellow-600",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-500/10 border-green-500/20",
    textColor: "text-green-600 dark:text-green-400",
    badgeColor: "bg-green-500/20 text-green-600",
  },
  urgent: {
    icon: AlertCircle,
    bgColor: "bg-red-500/10 border-red-500/20",
    textColor: "text-red-600 dark:text-red-400",
    badgeColor: "bg-red-500/20 text-red-600",
  },
};

export function AnnouncementsBanner({ announcements }: AnnouncementsBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem("dismissedAnnouncements");
    if (dismissed) {
      setDismissedIds(new Set(JSON.parse(dismissed)));
    }
  }, []);

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem("dismissedAnnouncements", JSON.stringify([...newDismissed]));
  };

  if (!mounted) return null;

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.has(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((announcement) => {
        const config = typeConfig[announcement.type];
        const Icon = config.icon;

        return (
          <Card
            key={announcement.id}
            className={`border ${config.bgColor} transition-all duration-300`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${config.badgeColor}`}>
                  <Icon className={`h-4 w-4 ${config.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${config.textColor}`}>
                      {announcement.title}
                    </h4>
                    <Badge variant="outline" className={`text-xs ${config.badgeColor} border-0`}>
                      {announcement.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(announcement.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleDismiss(announcement.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Compact version for navbar/sidebar
export function AnnouncementsCompact({ announcements }: AnnouncementsBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (announcements.length === 0) return null;

  const urgentCount = announcements.filter((a) => a.type === "urgent").length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Megaphone className="h-5 w-5" />
        {announcements.length > 0 && (
          <span
            className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white ${
              urgentCount > 0 ? "bg-red-500" : "bg-blue-500"
            }`}
          >
            {announcements.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-lg border bg-background shadow-lg">
            <div className="p-3 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Announcements
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {announcements.map((announcement) => {
                const config = typeConfig[announcement.type];
                const Icon = config.icon;

                return (
                  <div
                    key={announcement.id}
                    className="p-3 border-b last:border-0 hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`h-4 w-4 mt-0.5 ${config.textColor}`} />
                      <div>
                        <p className="font-medium text-sm">{announcement.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {announcement.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

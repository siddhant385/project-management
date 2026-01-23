"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Generate consistent gradient based on name
function getGradientFromName(name: string): string {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-500",
    "from-fuchsia-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-red-500 to-orange-500",
    "from-sky-500 to-blue-500",
  ];
  
  // Simple hash from name to pick consistent gradient
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

// Get initials from name (max 2 characters)
function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
  showBorder?: boolean;
  onClick?: () => void;
}

const sizeConfig: Record<AvatarSize, { container: string; text: string; image: number }> = {
  xs: { container: "h-6 w-6", text: "text-[10px]", image: 24 },
  sm: { container: "h-8 w-8", text: "text-xs", image: 32 },
  md: { container: "h-10 w-10", text: "text-sm", image: 40 },
  lg: { container: "h-12 w-12", text: "text-base", image: 48 },
  xl: { container: "h-16 w-16", text: "text-xl", image: 64 },
  "2xl": { container: "h-24 w-24", text: "text-3xl", image: 96 },
};

export function UserAvatar({
  src,
  name = "User",
  size = "md",
  className,
  showBorder = false,
  onClick,
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const config = sizeConfig[size];
  const initials = getInitials(name || "User");
  const gradient = getGradientFromName(name || "User");
  const showImage = src && !imageError;

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [src]);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full overflow-hidden",
        config.container,
        showBorder && "ring-2 ring-background shadow-sm",
        onClick && "cursor-pointer hover:opacity-90 transition-opacity",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Gradient Fallback - always rendered as base layer */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br flex items-center justify-center",
          gradient
        )}
      >
        <span className={cn("font-semibold text-white select-none", config.text)}>
          {initials}
        </span>
      </div>

      {/* Image Layer - rendered on top when available */}
      {showImage && (
        <div className={cn(
          "absolute inset-0 transition-opacity duration-200",
          imageLoading ? "opacity-0" : "opacity-100"
        )}>
          <Image
            src={src}
            alt={name || "User avatar"}
            fill
            sizes={`${config.image}px`}
            className="object-cover"
            onError={() => setImageError(true)}
            onLoad={() => setImageLoading(false)}
            priority={size === "2xl" || size === "xl"}
          />
        </div>
      )}
    </div>
  );
}

// Avatar Group for showing multiple avatars stacked
interface AvatarGroupProps {
  users: Array<{ src?: string | null; name?: string | null }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ users, max = 4, size = "sm", className }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayUsers.map((user, index) => (
        <UserAvatar
          key={index}
          src={user.src}
          name={user.name}
          size={size}
          showBorder
          className="hover:z-10"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted ring-2 ring-background",
            sizeConfig[size].container
          )}
        >
          <span className={cn("font-medium text-muted-foreground", sizeConfig[size].text)}>
            +{remaining}
          </span>
        </div>
      )}
    </div>
  );
}

import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";
import React, { useState } from "react";

import { AvatarPicker } from "./AvatarPicker";

import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProfileSummaryCard() {
  const { user, userProfile } = useAuth();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  // Determine verification status
  const isVerified = userProfile?.verification_status === "VERIFIED";

  // Dynamic badges based on user data
  const badges = [
    ...(userProfile?.user_type
      ? [
          {
            label:
              userProfile.user_type.charAt(0).toUpperCase() +
              userProfile.user_type.slice(1),
            variant:
              userProfile.user_type === "admin"
                ? ("admin" as const)
                : ("default" as const),
          },
        ]
      : []),
    ...(isVerified
      ? [
          {
            label: "Verified",
            variant: "verified" as const,
            icon: CheckCircle,
          },
        ]
      : []),
    { label: "Community Member", variant: "community" as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={cn(
        "mb-6 p-6 flex flex-col md:flex-row items-center gap-6",
        "group relative overflow-hidden",
        "bg-white/8 dark:bg-gray-900/8",
        "backdrop-blur-xl backdrop-saturate-150",
        "border border-amber-400/30 dark:border-amber-400/20",
        "rounded-3xl",
        "ring-0 ring-amber-400/0 ring-offset-0",
        "hover:ring-2 hover:ring-amber-400/60 hover:ring-offset-2 hover:ring-offset-amber-100/20",
        "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/20",
        "transition-all duration-500 ease-out",
        "hover:scale-[1.01]",
        // Glass Surface Texture
        "before:absolute before:inset-0 before:rounded-3xl",
        "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
        "before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300",
      )}
    >
      {/* Dew Drop Reflection Effect */}
      <div
        className={cn(
          "absolute top-4 left-4 w-3 h-3 rounded-full",
          "bg-gradient-to-br from-white/60 to-white/20",
          "backdrop-blur-sm",
          "shadow-lg shadow-white/20",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        )}
      />

      {/* Enhanced animated glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(233, 116, 81, 0.08))",
          filter: "blur(25px)",
          transform: "scale(1.15)",
        }}
      />

      <div className="flex-shrink-0 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <Avatar className="w-24 h-24 ring-2 ring-amber-400/40 ring-offset-2 ring-offset-amber-400/10">
            <AvatarImage
              src={userProfile?.avatar_url || undefined}
              alt={userProfile?.full_name || user?.email || ""}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-amber-400/20 to-coral-400/20 text-white">
              {userProfile?.full_name?.[0] || user?.email?.[0] || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Avatar picker trigger */}
          <div className="absolute -bottom-2 -right-2">
            <AvatarPicker
              open={avatarPickerOpen}
              onOpenChange={setAvatarPickerOpen}
              trigger={
                <Button
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full shadow-lg",
                    "bg-gradient-to-br from-amber-400 to-coral-400",
                    "hover:from-amber-500 hover:to-coral-500",
                    "text-white border-2 border-white/30",
                    "hover:scale-110 transition-all duration-300",
                  )}
                  title="Set your wild avatar"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </motion.div>
      </div>

      <div className="flex-1 relative z-10">
        <div className="text-xl font-bold mb-1 text-white/95">
          {userProfile?.full_name || user?.email}
        </div>
        <div className="text-white/70 mb-2">{user?.email}</div>
        <div className="flex flex-wrap gap-2 mb-2">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Badge
                variant={badge.variant}
                className={cn(
                  "flex items-center gap-1",
                  "bg-white/10 backdrop-blur-sm",
                  "border border-amber-400/30",
                  "text-white/90",
                )}
              >
                {badge.icon && <badge.icon className="h-3 w-3" />}
                {badge.label}
              </Badge>
            </motion.div>
          ))}
        </div>
        <div className="text-sm text-white/70">
          <span className="mr-4">
            Member since:{" "}
            <b className="text-white/90">
              {userProfile?.created_at
                ? new Date(userProfile.created_at).getFullYear()
                : "N/A"}
            </b>
          </span>
          {!isVerified && (
            <span className="text-amber-300">• ID verification pending</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

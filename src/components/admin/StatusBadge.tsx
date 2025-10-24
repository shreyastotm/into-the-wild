import React, { Component } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Pause,
  Play,
  Ban,
  Shield,
  User,
  UserCheck,
  UserX,
  Calendar,
  CalendarCheck,
  CalendarX,
  CreditCard,
  FileText,
  Image,
  Upload,
  Download,
} from "lucide-react";

export interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = "md",
  showIcon = true,
  className = "",
}) => {
  const getStatusConfig = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: React.ReactNode;
      }
    > = {
      // User verification statuses
      VERIFIED: {
        label: "Verified",
        variant: "default",
        icon: <UserCheck className="h-3 w-3" />,
      },
      PENDING: {
        label: "Pending",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
      },
      REJECTED: {
        label: "Rejected",
        variant: "destructive",
        icon: <UserX className="h-3 w-3" />,
      },
      BANNED: {
        label: "Banned",
        variant: "destructive",
        icon: <Ban className="h-3 w-3" />,
      },

      // Payment statuses
      PAID: {
        label: "Paid",
        variant: "default",
        icon: <CreditCard className="h-3 w-3" />,
      },
      PENDING_PAYMENT: {
        label: "Pending Payment",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
      },
      PROOF_UPLOADED: {
        label: "Proof Uploaded",
        variant: "outline",
        icon: <FileText className="h-3 w-3" />,
      },
      CANCELLED: {
        label: "Cancelled",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
      },

      // Event statuses
      DRAFT: {
        label: "Draft",
        variant: "outline",
        icon: <FileText className="h-3 w-3" />,
      },
      PUBLISHED: {
        label: "Published",
        variant: "default",
        icon: <CalendarCheck className="h-3 w-3" />,
      },
      ONGOING: {
        label: "Ongoing",
        variant: "default",
        icon: <Play className="h-3 w-3" />,
      },
      COMPLETED: {
        label: "Completed",
        variant: "secondary",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      EVENT_CANCELLED: {
        label: "Cancelled",
        variant: "destructive",
        icon: <CalendarX className="h-3 w-3" />,
      },

      // Registration statuses
      REGISTERED: {
        label: "Registered",
        variant: "default",
        icon: <User className="h-3 w-3" />,
      },
      CONFIRMED: {
        label: "Confirmed",
        variant: "default",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      WAITLISTED: {
        label: "Waitlisted",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
      },

      // File statuses
      UPLOADED: {
        label: "Uploaded",
        variant: "default",
        icon: <Upload className="h-3 w-3" />,
      },
      PROCESSING: {
        label: "Processing",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
      },
      FAILED: {
        label: "Failed",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
      },

      // General statuses
      ACTIVE: {
        label: "Active",
        variant: "default",
        icon: <Play className="h-3 w-3" />,
      },
      INACTIVE: {
        label: "Inactive",
        variant: "secondary",
        icon: <Pause className="h-3 w-3" />,
      },
      SUCCESS: {
        label: "Success",
        variant: "default",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      ERROR: {
        label: "Error",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
      },
      WARNING: {
        label: "Warning",
        variant: "secondary",
        icon: <AlertTriangle className="h-3 w-3" />,
      },
    };

    return (
      statusMap[status.toUpperCase()] || {
        label: status,
        variant: "outline" as const,
        icon: <Shield className="h-3 w-3" />,
      }
    );
  };

  const config = getStatusConfig(status);
  const finalVariant = variant || config.variant;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <Badge
      variant={finalVariant}
      className={`${sizeClasses[size]} ${className} flex items-center gap-1`}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};

// Specialized status badge components for common use cases
export const UserStatusBadge: React.FC<
  Omit<StatusBadgeProps, "status"> & {
    status: "VERIFIED" | "PENDING" | "REJECTED" | "BANNED";
  }
> = (props) => <StatusBadge {...props} />;

export const PaymentStatusBadge: React.FC<
  Omit<StatusBadgeProps, "status"> & {
    status: "PAID" | "PENDING_PAYMENT" | "PROOF_UPLOADED" | "CANCELLED";
  }
> = (props) => <StatusBadge {...props} />;

export const EventStatusBadge: React.FC<
  Omit<StatusBadgeProps, "status"> & {
    status: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  }
> = (props) => <StatusBadge {...props} />;

export const RegistrationStatusBadge: React.FC<
  Omit<StatusBadgeProps, "status"> & {
    status: "REGISTERED" | "CONFIRMED" | "WAITLISTED" | "CANCELLED";
  }
> = (props) => <StatusBadge {...props} />;

export const FileStatusBadge: React.FC<
  Omit<StatusBadgeProps, "status"> & {
    status: "UPLOADED" | "PROCESSING" | "FAILED";
  }
> = (props) => <StatusBadge {...props} />;

// Status badge with count
export const StatusBadgeWithCount: React.FC<
  StatusBadgeProps & {
    count?: number;
  }
> = ({ count, ...props }) => (
  <div className="flex items-center gap-2" data-testid="statusbadge">
    <StatusBadge {...props} />
    {count !== undefined && (
      <span className="text-sm text-muted-foreground">({count})</span>
    )}
  </div>
);

// Status indicator (just the icon)
export const StatusIndicator: React.FC<{
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ status, size = "md", className = "" }) => {
  const getStatusConfig = (status: string) => {
    const statusMap: Record<
      string,
      {
        icon: React.ReactNode;
        color: string;
      }
    > = {
      VERIFIED: { icon: <CheckCircle />, color: "text-green-500" },
      PENDING: { icon: <Clock />, color: "text-yellow-500" },
      REJECTED: { icon: <XCircle />, color: "text-red-500" },
      PAID: { icon: <CreditCard />, color: "text-green-500" },
      ACTIVE: { icon: <Play />, color: "text-green-500" },
      INACTIVE: { icon: <Pause />, color: "text-muted-foreground" },
    };

    return (
      statusMap[status.toUpperCase()] || {
        icon: <Shield />,
        color: "text-muted-foreground",
      }
    );
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={`${sizeClasses[size]} ${config.color} ${className}`} data-testid="statusbadge">
      {config.icon}
    </div>
  );
};

export default StatusBadge;

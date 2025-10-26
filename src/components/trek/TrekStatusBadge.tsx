import {
  AlertTriangle,
  Bus,
  Calendar,
  CalendarCheck,
  CalendarX,
  Car,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Mountain,
  Pause,
  Play,
  Train,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import React, { Component } from "react";

import { Badge } from "@/components/ui/badge";

export interface TrekStatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const TrekStatusBadge: React.FC<TrekStatusBadgeProps> = ({
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
      // Event Statuses
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
      OPEN_FOR_REGISTRATION: {
        label: "Open for Registration",
        variant: "default",
        icon: <Users className="h-3 w-3" />,
      },
      REGISTRATION_CLOSED: {
        label: "Registration Closed",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
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
      CANCELLED: {
        label: "Cancelled",
        variant: "destructive",
        icon: <CalendarX className="h-3 w-3" />,
      },

      // Registration Statuses
      REGISTERED: {
        label: "Registered",
        variant: "default",
        icon: <UserCheck className="h-3 w-3" />,
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
      CANCELLED_REGISTRATION: {
        label: "Cancelled",
        variant: "destructive",
        icon: <UserX className="h-3 w-3" />,
      },

      // Payment Statuses
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
      PAYMENT_FAILED: {
        label: "Payment Failed",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
      },

      // Transport Statuses
      TRANSPORT_ARRANGED: {
        label: "Transport Arranged",
        variant: "default",
        icon: <Car className="h-3 w-3" />,
      },
      CARPOOL_AVAILABLE: {
        label: "Carpool Available",
        variant: "default",
        icon: <Car className="h-3 w-3" />,
      },
      BUS_TRANSPORT: {
        label: "Bus Transport",
        variant: "default",
        icon: <Bus className="h-3 w-3" />,
      },
      SELF_TRANSPORT: {
        label: "Self Transport",
        variant: "outline",
        icon: <Car className="h-3 w-3" />,
      },

      // Availability Statuses
      AVAILABLE: {
        label: "Available",
        variant: "default",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      LIMITED_SPOTS: {
        label: "Limited Spots",
        variant: "secondary",
        icon: <AlertTriangle className="h-3 w-3" />,
      },
      FULLY_BOOKED: {
        label: "Fully Booked",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
      },
      WAITLIST_ONLY: {
        label: "Waitlist Only",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
      },

      // Time-based Statuses
      UPCOMING: {
        label: "Upcoming",
        variant: "default",
        icon: <Calendar className="h-3 w-3" />,
      },
      TODAY: {
        label: "Today",
        variant: "default",
        icon: <CalendarCheck className="h-3 w-3" />,
      },
      TOMORROW: {
        label: "Tomorrow",
        variant: "default",
        icon: <Calendar className="h-3 w-3" />,
      },
      THIS_WEEK: {
        label: "This Week",
        variant: "default",
        icon: <Calendar className="h-3 w-3" />,
      },
      NEXT_WEEK: {
        label: "Next Week",
        variant: "default",
        icon: <Calendar className="h-3 w-3" />,
      },

      // General Statuses
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
      PENDING: {
        label: "Pending",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
      },
      APPROVED: {
        label: "Approved",
        variant: "default",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      REJECTED: {
        label: "Rejected",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    return (
      statusMap[status.toUpperCase()] || {
        label: status,
        variant: "outline" as const,
        icon: <AlertTriangle className="h-3 w-3" />,
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
export const EventStatusBadge: React.FC<
  Omit<TrekStatusBadgeProps, "status"> & {
    status:
      | "DRAFT"
      | "PUBLISHED"
      | "OPEN_FOR_REGISTRATION"
      | "REGISTRATION_CLOSED"
      | "ONGOING"
      | "COMPLETED"
      | "CANCELLED";
  }
> = (props) => <TrekStatusBadge {...props} />;

export const RegistrationStatusBadge: React.FC<
  Omit<TrekStatusBadgeProps, "status"> & {
    status:
      | "REGISTERED"
      | "CONFIRMED"
      | "WAITLISTED"
      | "CANCELLED_REGISTRATION";
  }
> = (props) => <TrekStatusBadge {...props} />;

export const PaymentStatusBadge: React.FC<
  Omit<TrekStatusBadgeProps, "status"> & {
    status: "PAID" | "PENDING_PAYMENT" | "PROOF_UPLOADED" | "PAYMENT_FAILED";
  }
> = (props) => <TrekStatusBadge {...props} />;

export const AvailabilityStatusBadge: React.FC<
  Omit<TrekStatusBadgeProps, "status"> & {
    status: "AVAILABLE" | "LIMITED_SPOTS" | "FULLY_BOOKED" | "WAITLIST_ONLY";
  }
> = (props) => <TrekStatusBadge {...props} />;

export const TransportStatusBadge: React.FC<
  Omit<TrekStatusBadgeProps, "status"> & {
    status:
      | "TRANSPORT_ARRANGED"
      | "CARPOOL_AVAILABLE"
      | "BUS_TRANSPORT"
      | "SELF_TRANSPORT";
  }
> = (props) => <TrekStatusBadge {...props} />;

// Status badge with count
export const TrekStatusBadgeWithCount: React.FC<
  TrekStatusBadgeProps & {
    count?: number;
  }
> = ({ count, ...props }) => (
  <div className="flex items-center gap-2">
    <TrekStatusBadge {...props} />
    {count !== undefined && (
      <span className="text-sm text-muted-foreground">({count})</span>
    )}
  </div>
);

// Status indicator (just the icon)
export const TrekStatusIndicator: React.FC<{
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
      PUBLISHED: { icon: <CalendarCheck />, color: "text-success" },
      OPEN_FOR_REGISTRATION: { icon: <Users />, color: "text-info" },
      ONGOING: { icon: <Play />, color: "text-success" },
      COMPLETED: { icon: <CheckCircle />, color: "text-muted-foreground" },
      CANCELLED: { icon: <XCircle />, color: "text-destructive" },
      PAID: { icon: <CreditCard />, color: "text-success" },
      PENDING_PAYMENT: { icon: <Clock />, color: "text-warning" },
      AVAILABLE: { icon: <CheckCircle />, color: "text-success" },
      FULLY_BOOKED: { icon: <XCircle />, color: "text-destructive" },
    };

    return (
      statusMap[status.toUpperCase()] || {
        icon: <AlertTriangle />,
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
    <div className={`${sizeClasses[size]} ${config.color} ${className}`}>
      {config.icon}
    </div>
  );
};

export default TrekStatusBadge;

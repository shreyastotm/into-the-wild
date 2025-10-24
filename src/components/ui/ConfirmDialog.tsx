import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

import React, { Component } from "react";

export interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  icon?: LucideIcon;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon: Icon,
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
  trigger,
  open,
  onOpenChange,
  className = "",
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirm action failed:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          actionVariant: "destructive" as const,
          iconColor: "text-destructive",
          borderColor: "border-destructive/20",
        };
      case "warning":
        return {
          actionVariant: "default" as const,
          iconColor: "text-yellow-600",
          borderColor: "border-yellow-200",
        };
      default:
        return {
          actionVariant: "default" as const,
          iconColor: "text-primary",
          borderColor: "border-border",
        };
    }
  };

  const styles = getVariantStyles();

  const dialogContent = (
    <AlertDialogContent className={className}>
      <AlertDialogHeader>
        <div className="flex items-center space-x-3">
          {Icon && (
            <div
              className={`p-2 rounded-full bg-muted ${styles.borderColor} border`}
            >
              <Icon className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
          )}
          <div className="flex-1">
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
        </div>
        <AlertDialogDescription className="text-left mt-3">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel onClick={handleCancel} disabled={loading}>
          {cancelText}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          disabled={disabled || loading}
          className={
            variant === "destructive"
              ? "bg-destructive hover:bg-destructive/90"
              : ""
          }
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            confirmText
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (trigger) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        {dialogContent}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {dialogContent}
    </AlertDialog>
  );
};

// Specialized confirmation dialogs for common use cases
export const DeleteConfirmDialog: React.FC<
  Omit<ConfirmDialogProps, "variant" | "confirmText" | "icon"> & {
    itemName?: string;
    itemType?: string;
  }
> = ({
  itemName,
  itemType = "item",
  title = "Delete Confirmation",
  description,
  ...props
}) => {
  const defaultDescription = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  return (
    <ConfirmDialog
      {...props}
      title={title}
      description={description || defaultDescription}
      variant="destructive"
      confirmText="Delete"
      icon={require("lucide-react").Trash2}
    />
  );
};

export const WarningConfirmDialog: React.FC<
  Omit<ConfirmDialogProps, "variant" | "icon"> & {
    warningText?: string;
  }
> = ({ warningText, title = "Warning", description, ...props }) => {
  return (
    <ConfirmDialog
      {...props}
      title={title}
      description={description}
      variant="warning"
      confirmText="Proceed"
      icon={require("lucide-react").AlertTriangle}
    />
  );
};

export const InfoConfirmDialog: React.FC<
  Omit<ConfirmDialogProps, "variant" | "icon">
> = ({ title = "Confirmation", ...props }) => {
  return (
    <ConfirmDialog
      {...props}
      title={title}
      variant="default"
      icon={require("lucide-react").Info}
    />
  );
};

export default ConfirmDialog;

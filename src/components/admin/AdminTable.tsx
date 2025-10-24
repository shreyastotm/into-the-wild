import { formatIndianDate } from '@/utils/indianStandards';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { format } from "date-fns";

import React, { Component } from "react";

export interface AdminTableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  disabled?: (row: any) => boolean;
  hidden?: (row: any) => boolean;
}

export interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  cardTitle?: string;
  cardDescription?: string;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSort?: (column: keyof T | string, direction: "asc" | "desc") => void;
  sortColumn?: keyof T | string;
  sortDirection?: "asc" | "desc";
  actions?: AdminTableAction[];
  bulkActions?: AdminTableAction[];
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  selectable?: boolean;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  refreshLoading?: boolean;
}

const AdminTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  emptyAction,
  className = "",
  cardTitle,
  cardDescription,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection = "asc",
  actions = [],
  bulkActions = [],
  selectedRows = [],
  onSelectionChange,
  selectable = false,
  searchable = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onRefresh,
  refreshLoading = false,
}: AdminTableProps<T>) => {
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? data : []);
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedRows, row]);
    } else {
      onSelectionChange(selectedRows.filter((r) => r !== row));
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.includes(row);
  };

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < data.length;

  const renderActions = (row: T) => {
    const visibleActions = actions.filter(
      (action) => !action.hidden || !action.hidden(row),
    );

    if (visibleActions.length === 0) return null;

    if (visibleActions.length === 1) {
      const action = visibleActions[0];
      return (
        <Button
          variant={action.variant || "outline"}
          size="sm"
          onClick={() => action.onClick(row)}
          disabled={action.disabled?.(row)}
        >
          {action.icon}
          {action.label}
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visibleActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(row)}
              disabled={action.disabled?.(row)}
              className={
                action.variant === "destructive" ? "text-destructive" : ""
              }
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderBulkActions = () => {
    if (bulkActions.length === 0 || selectedRows.length === 0) return null;

    return (
      <div className="flex items-center space-x-2 p-2 bg-muted rounded-md" data-testid="admintable">
        <span className="text-sm text-muted-foreground">
          {selectedRows.length} selected
        </span>
        {bulkActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size="sm"
            onClick={() => action.onClick(selectedRows)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    );
  };

  const enhancedColumns: Column<T>[] = [
    ...(selectable
      ? [
          {
            key: "select" as keyof T,
            label: (
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onCheckedChange={handleSelectAll}
              />
            ),
            render: (value: any, row: T) => (
              <Checkbox
                checked={isRowSelected(row)}
                onCheckedChange={(checked) =>
                  handleSelectRow(row, checked as boolean)
                }
              />
            ),
            className: "w-12",
            headerClassName: "w-12",
          },
        ]
      : []),
    ...columns,
    ...(actions.length > 0
      ? [
          {
            key: "actions" as keyof T,
            label: "Actions",
            render: (value: any, row: T) => renderActions(row),
            className: "w-20",
            headerClassName: "w-20",
          },
        ]
      : []),
  ];

  return (
    <div className={className} data-testid="admintable">
      {/* Bulk Actions */}
      {renderBulkActions()}

      {/* Data Table */}
      <DataTable
        data={data}
        columns={enhancedColumns}
        loading={loading}
        emptyMessage={emptyMessage}
        emptyAction={emptyAction}
        cardTitle={cardTitle}
        cardDescription={cardDescription}
        showPagination={showPagination}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onSort={onSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        searchable={searchable}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />
    </div>
  );
};

// Specialized admin table components for common use cases
export const UserAdminTable: React.FC<
  Omit<AdminTableProps<any>, "columns"> & {
    onVerify?: (user: any) => void;
    onReject?: (user: any) => void;
    onEdit?: (user: any) => void;
    onDelete?: (user: any) => void;
  }
> = ({ onVerify, onReject, onEdit, onDelete, ...props }) => {
  const columns: Column<any>[] = [
    {
      key: "full_name",
      label: "Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "user_type",
      label: "Type",
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "verification_status",
      label: "Status",
      render: (value) => {
        const statusConfig = {
          VERIFIED: {
            label: "Verified",
            variant: "default" as const,
            icon: <CheckCircle className="h-3 w-3" />,
          },
          PENDING: {
            label: "Pending",
            variant: "secondary" as const,
            icon: <AlertTriangle className="h-3 w-3" />,
          },
          REJECTED: {
            label: "Rejected",
            variant: "destructive" as const,
            icon: <XCircle className="h-3 w-3" />,
          },
        };
        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.PENDING;
        return (
          <Badge variant={config.variant} className="flex items-center gap-1">
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      render: (value) => formatIndianDate(new Date(value)),
    },
  ];

  const actions: AdminTableAction[] = [
    ...(onEdit
      ? [
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: onEdit,
          },
        ]
      : []),
    ...(onVerify
      ? [
          {
            label: "Verify",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: onVerify,
            variant: "default" as const,
            hidden: (row) => row.verification_status === "VERIFIED",
          },
        ]
      : []),
    ...(onReject
      ? [
          {
            label: "Reject",
            icon: <XCircle className="h-4 w-4" />,
            onClick: onReject,
            variant: "destructive" as const,
            hidden: (row) => row.verification_status === "REJECTED",
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: onDelete,
            variant: "destructive" as const,
          },
        ]
      : []),
  ];

  return (
    <AdminTable {...props} columns={columns} actions={actions} selectable />
  );
};

export const RegistrationAdminTable: React.FC<
  Omit<AdminTableProps<any>, "columns"> & {
    onApprove?: (registration: any) => void;
    onReject?: (registration: any) => void;
    onView?: (registration: any) => void;
  }
> = ({ onApprove, onReject, onView, ...props }) => {
  const columns: Column<any>[] = [
    {
      key: "user",
      label: "User",
      render: (value, row) => (
        <div data-testid="admintable">
          <div className="font-medium" data-testid="admintable">{row.user?.full_name || "Unknown"}</div>
          <div className="text-sm text-muted-foreground" data-testid="admintable">{row.user?.email}</div>
        </div>
      ),
    },
    {
      key: "trek_event",
      label: "Event",
      render: (value, row) => (
        <div data-testid="admintable">
          <div className="font-medium" data-testid="admintable">
            {row.trek_event?.name || "Unknown Event"}
          </div>
          <div className="text-sm text-muted-foreground" data-testid="admintable">
            {formatIndianDate(new Date(row.trek_event?.start_datetime))}
          </div>
        </div>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (value) => {
        const statusConfig = {
          Paid: { label: "Paid", variant: "default" as const },
          Pending: { label: "Pending", variant: "secondary" as const },
          ProofUploaded: {
            label: "Proof Uploaded",
            variant: "outline" as const,
          },
          Cancelled: { label: "Cancelled", variant: "destructive" as const },
        };
        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.Pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "booking_datetime",
      label: "Registered",
      render: (value) => formatIndianDate(new Date(value)),
    },
  ];

  const actions: AdminTableAction[] = [
    ...(onView
      ? [
          {
            label: "View",
            icon: <Eye className="h-4 w-4" />,
            onClick: onView,
          },
        ]
      : []),
    ...(onApprove
      ? [
          {
            label: "Approve",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: onApprove,
            variant: "default" as const,
            hidden: (row) => row.payment_status === "Paid",
          },
        ]
      : []),
    ...(onReject
      ? [
          {
            label: "Reject",
            icon: <XCircle className="h-4 w-4" />,
            onClick: onReject,
            variant: "destructive" as const,
          },
        ]
      : []),
  ];

  return (
    <AdminTable {...props} columns={columns} actions={actions} selectable />
  );
};

export default AdminTable;

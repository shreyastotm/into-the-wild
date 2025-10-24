import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
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
  actions?: (row: T) => React.ReactNode;
  mobileCard?: (row: T) => React.ReactNode;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, any>>({
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
  actions,
  mobileCard,
  searchable = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
}: DataTableProps<T>) {
  const handleSort = (column: keyof T | string) => {
    if (!onSort) return;

    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    onSort(column, newDirection);
  };

  const renderCellContent = (column: Column<T>, row: T) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row);
    }

    const value = row[column.key as keyof T];
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }

    return <span>{String(value)}</span>;
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          {columns.map((column, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
          {actions && <Skeleton className="h-8 w-8" />}
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">{emptyMessage}</p>
      {emptyAction}
    </div>
  );

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderSearch = () => {
    if (!searchable) return null;

    return (
      <div className="mb-4">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
    );
  };

  const renderDesktopTable = () => (
    <div className="hidden md:block rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={`${column.headerClassName || ""} ${
                  column.sortable ? "cursor-pointer hover:bg-muted/50" : ""
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortColumn === column.key && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
            {actions && <TableHead className="w-[50px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  className={column.className}
                >
                  {renderCellContent(column, row)}
                </TableCell>
              ))}
              {actions && <TableCell>{actions(row)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderMobileCards = () => (
    <div className="md:hidden space-y-4">
      {data.map((row, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            {mobileCard ? (
              mobileCard(row)
            ) : (
              <div className="space-y-2">
                {columns.map((column) => (
                  <div
                    key={String(column.key)}
                    className="flex justify-between"
                  >
                    <span className="font-medium text-sm">{column.label}:</span>
                    <span className="text-sm text-muted-foreground">
                      {renderCellContent(column, row)}
                    </span>
                  </div>
                ))}
                {actions && <div className="pt-2 border-t">{actions(row)}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const content = (
    <div className={className}>
      {renderSearch()}

      {loading ? (
        renderLoadingSkeleton()
      ) : data.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderDesktopTable()}
          {renderMobileCards()}
        </>
      )}

      {renderPagination()}
    </div>
  );

  if (cardTitle || cardDescription) {
    return (
      <Card>
        {(cardTitle || cardDescription) && (
          <CardHeader>
            {cardTitle && <CardTitle>{cardTitle}</CardTitle>}
            {cardDescription && (
              <p className="text-sm text-muted-foreground">{cardDescription}</p>
            )}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return content;
}

export default DataTable;

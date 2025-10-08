import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Checkbox,
  ChevronDown,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Mail,
  Settings,
  AlertTriangle
} from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  onClick: (selectedItems: any[]) => void | Promise<void>;
  disabled?: (selectedItems: any[]) => boolean;
  hidden?: (selectedItems: any[]) => boolean;
  confirmMessage?: string;
  loading?: boolean;
}

export interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
  position?: 'top' | 'bottom' | 'sticky';
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  totalCount,
  actions,
  onSelectAll,
  onClearSelection,
  className = '',
  variant = 'default',
  position = 'top',
}) => {
  const visibleActions = actions.filter(action => !action.hidden || !action.hidden([]));
  const hasSelection = selectedCount > 0;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const handleActionClick = async (action: BulkAction) => {
    if (action.confirmMessage) {
      const confirmed = window.confirm(action.confirmMessage);
      if (!confirmed) return;
    }
    
    try {
      await action.onClick([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const renderCompactActions = () => (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      {visibleActions.slice(0, 2).map((action) => (
        <Button
          key={action.id}
          variant={action.variant || 'outline'}
          size="sm"
          onClick={() => handleActionClick(action)}
          disabled={action.loading || (action.disabled && action.disabled([]))}
        >
          {action.loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            action.icon
          )}
          {action.label}
        </Button>
      ))}
      {visibleActions.length > 2 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              More
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {visibleActions.slice(2).map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={action.loading || (action.disabled && action.disabled([]))}
                className={action.variant === 'destructive' ? 'text-destructive' : ''}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  const renderDefaultActions = () => (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isAllSelected}
            indeterminate={selectedCount > 0 && !isAllSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm font-medium">
            {hasSelection ? `${selectedCount} selected` : 'Select items'}
          </span>
        </div>
        
        {hasSelection && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {selectedCount} of {totalCount}
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {hasSelection && onClearSelection && (
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        )}
        
        {visibleActions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={() => handleActionClick(action)}
            disabled={action.loading || (action.disabled && action.disabled([]))}
          >
            {action.loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              action.icon
            )}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderFloatingActions = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          {visibleActions.slice(0, 3).map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={() => handleActionClick(action)}
              disabled={action.loading || (action.disabled && action.disabled([]))}
            >
              {action.loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                action.icon
              )}
            </Button>
          ))}
          {visibleActions.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {visibleActions.slice(3).map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    disabled={action.loading || (action.disabled && action.disabled([]))}
                    className={action.variant === 'destructive' ? 'text-destructive' : ''}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );

  if (!hasSelection && variant !== 'floating') return null;

  const content = (() => {
    switch (variant) {
      case 'compact':
        return renderCompactActions();
      case 'floating':
        return renderFloatingActions();
      default:
        return renderDefaultActions();
    }
  })();

  const positionClasses = {
    top: 'mb-4',
    bottom: 'mt-4',
    sticky: 'sticky top-0 z-10 mb-4',
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      {content}
    </div>
  );
};

// Pre-built bulk action sets for common admin operations
export const UserBulkActions: BulkAction[] = [
  {
    id: 'verify',
    label: 'Verify Selected',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'default',
    onClick: (users) => console.log('Verify users:', users),
    confirmMessage: 'Are you sure you want to verify the selected users?',
  },
  {
    id: 'reject',
    label: 'Reject Selected',
    icon: <XCircle className="h-4 w-4" />,
    variant: 'destructive',
    onClick: (users) => console.log('Reject users:', users),
    confirmMessage: 'Are you sure you want to reject the selected users?',
  },
  {
    id: 'export',
    label: 'Export Data',
    icon: <Download className="h-4 w-4" />,
    variant: 'outline',
    onClick: (users) => console.log('Export users:', users),
  },
  {
    id: 'email',
    label: 'Send Email',
    icon: <Mail className="h-4 w-4" />,
    variant: 'outline',
    onClick: (users) => console.log('Email users:', users),
  },
  {
    id: 'delete',
    label: 'Delete Selected',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    onClick: (users) => console.log('Delete users:', users),
    confirmMessage: 'Are you sure you want to delete the selected users? This action cannot be undone.',
  },
];

export const RegistrationBulkActions: BulkAction[] = [
  {
    id: 'approve',
    label: 'Approve Selected',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'default',
    onClick: (registrations) => console.log('Approve registrations:', registrations),
    confirmMessage: 'Are you sure you want to approve the selected registrations?',
  },
  {
    id: 'reject',
    label: 'Reject Selected',
    icon: <XCircle className="h-4 w-4" />,
    variant: 'destructive',
    onClick: (registrations) => console.log('Reject registrations:', registrations),
    confirmMessage: 'Are you sure you want to reject the selected registrations?',
  },
  {
    id: 'export',
    label: 'Export Data',
    icon: <Download className="h-4 w-4" />,
    variant: 'outline',
    onClick: (registrations) => console.log('Export registrations:', registrations),
  },
  {
    id: 'email',
    label: 'Send Notifications',
    icon: <Mail className="h-4 w-4" />,
    variant: 'outline',
    onClick: (registrations) => console.log('Email registrations:', registrations),
  },
];

export const EventBulkActions: BulkAction[] = [
  {
    id: 'publish',
    label: 'Publish Selected',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'default',
    onClick: (events) => console.log('Publish events:', events),
    confirmMessage: 'Are you sure you want to publish the selected events?',
  },
  {
    id: 'unpublish',
    label: 'Unpublish Selected',
    icon: <XCircle className="h-4 w-4" />,
    variant: 'secondary',
    onClick: (events) => console.log('Unpublish events:', events),
    confirmMessage: 'Are you sure you want to unpublish the selected events?',
  },
  {
    id: 'duplicate',
    label: 'Duplicate Selected',
    icon: <Settings className="h-4 w-4" />,
    variant: 'outline',
    onClick: (events) => console.log('Duplicate events:', events),
  },
  {
    id: 'delete',
    label: 'Delete Selected',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    onClick: (events) => console.log('Delete events:', events),
    confirmMessage: 'Are you sure you want to delete the selected events? This action cannot be undone.',
  },
];

export default BulkActions;

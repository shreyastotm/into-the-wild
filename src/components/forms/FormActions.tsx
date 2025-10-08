import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, X, RotateCcw, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface FormActionsProps {
  primaryAction?: FormAction;
  secondaryActions?: FormAction[];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'card' | 'sticky' | 'floating';
  position?: 'left' | 'center' | 'right' | 'between';
  size?: 'sm' | 'md' | 'lg';
  showSeparator?: boolean;
  separatorClassName?: string;
  stickyOffset?: number;
  onSave?: () => void | Promise<void>;
  onCancel?: () => void;
  onReset?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  nextLabel?: string;
  previousLabel?: string;
  showSave?: boolean;
  showCancel?: boolean;
  showReset?: boolean;
  showNext?: boolean;
  showPrevious?: boolean;
  saveLoading?: boolean;
  cancelLoading?: boolean;
  resetLoading?: boolean;
  nextLoading?: boolean;
  previousLoading?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  primaryAction,
  secondaryActions = [],
  loading = false,
  disabled = false,
  className = '',
  variant = 'default',
  position = 'right',
  size = 'md',
  showSeparator = true,
  separatorClassName = '',
  stickyOffset = 0,
  onSave,
  onCancel,
  onReset,
  onNext,
  onPrevious,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  resetLabel = 'Reset',
  nextLabel = 'Next',
  previousLabel = 'Previous',
  showSave = true,
  showCancel = true,
  showReset = false,
  showNext = false,
  showPrevious = false,
  saveLoading = false,
  cancelLoading = false,
  resetLoading = false,
  nextLoading = false,
  previousLoading = false,
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const spacingClasses = {
    sm: 'space-x-2',
    md: 'space-x-3',
    lg: 'space-x-4'
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const handleAction = async (action: FormAction) => {
    if (action.disabled || action.loading) return;
    try {
      await action.onClick();
    } catch (error) {
      console.error('Form action failed:', error);
    }
  };

  const renderButton = (action: FormAction, index: number) => (
    <Button
      key={index}
      variant={action.variant || 'outline'}
      size={action.size || size}
      onClick={() => handleAction(action)}
      disabled={disabled || action.disabled || action.loading || loading}
      className={cn(sizeClasses[action.size || size], action.className)}
      type={action.type || 'button'}
    >
      {action.loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </>
      )}
    </Button>
  );

  const renderDefaultActions = () => {
    const actions: FormAction[] = [];

    // Add custom actions first
    if (secondaryActions.length > 0) {
      actions.push(...secondaryActions);
    }

    // Add standard actions
    if (showPrevious && onPrevious) {
      actions.push({
        label: previousLabel,
        onClick: onPrevious,
        variant: 'outline',
        icon: <ArrowLeft className="h-4 w-4" />,
        loading: previousLoading,
      });
    }

    if (showReset && onReset) {
      actions.push({
        label: resetLabel,
        onClick: onReset,
        variant: 'outline',
        icon: <RotateCcw className="h-4 w-4" />,
        loading: resetLoading,
      });
    }

    if (showCancel && onCancel) {
      actions.push({
        label: cancelLabel,
        onClick: onCancel,
        variant: 'outline',
        icon: <X className="h-4 w-4" />,
        loading: cancelLoading,
      });
    }

    if (showSave && onSave) {
      actions.push({
        label: saveLabel,
        onClick: onSave,
        variant: 'default',
        icon: <Save className="h-4 w-4" />,
        loading: saveLoading,
      });
    }

    if (showNext && onNext) {
      actions.push({
        label: nextLabel,
        onClick: onNext,
        variant: 'default',
        icon: <ArrowRight className="h-4 w-4" />,
        loading: nextLoading,
      });
    }

    return actions;
  };

  const renderActions = () => {
    const actions = primaryAction ? [primaryAction, ...secondaryActions] : renderDefaultActions();

    if (actions.length === 0) return null;

    const positionClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between'
    };

    return (
      <div className={cn('flex items-center', positionClasses[position], spacingClasses[size])}>
        {actions.map((action, index) => renderButton(action, index))}
      </div>
    );
  };

  const renderSeparator = () => {
    if (!showSeparator) return null;
    return <Separator className={separatorClassName} />;
  };

  const content = (
    <>
      {renderSeparator()}
      <div className={cn('flex items-center', paddingClasses[size], className)}>
        {renderActions()}
      </div>
    </>
  );

  // Sticky variant - fixed at bottom
  if (variant === 'sticky') {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 bg-background border-t z-50"
        style={{ paddingTop: `${stickyOffset}px` }}
      >
        {content}
      </div>
    );
  }

  // Floating variant - floating at bottom
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="shadow-lg">
          <CardContent className={paddingClasses[size]}>
            {renderActions()}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Card variant - wrapped in card
  if (variant === 'card') {
    return (
      <Card>
        <CardContent className={paddingClasses[size]}>
          {renderActions()}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return content;
};

// Specialized form actions for common use cases
export const SaveCancelActions: React.FC<Omit<FormActionsProps, 'showSave' | 'showCancel'>> = ({
  onSave,
  onCancel,
  saveLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  ...props
}) => (
  <FormActions
    {...props}
    onSave={onSave}
    onCancel={onCancel}
    saveLabel={saveLabel}
    cancelLabel={cancelLabel}
    showSave={true}
    showCancel={true}
  />
);

export const WizardActions: React.FC<Omit<FormActionsProps, 'showNext' | 'showPrevious' | 'showSave'>> = ({
  onNext,
  onPrevious,
  onSave,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  saveLabel = 'Finish',
  ...props
}) => (
  <FormActions
    {...props}
    onNext={onNext}
    onPrevious={onPrevious}
    onSave={onSave}
    nextLabel={nextLabel}
    previousLabel={previousLabel}
    saveLabel={saveLabel}
    showNext={true}
    showPrevious={true}
    showSave={true}
  />
);

export const DeleteActions: React.FC<Omit<FormActionsProps, 'showSave' | 'showCancel'>> = ({
  onSave,
  onCancel,
  saveLabel = 'Delete',
  cancelLabel = 'Cancel',
  ...props
}) => (
  <FormActions
    {...props}
    onSave={onSave}
    onCancel={onCancel}
    saveLabel={saveLabel}
    cancelLabel={cancelLabel}
    showSave={true}
    showCancel={true}
    primaryAction={{
      label: saveLabel,
      onClick: onSave!,
      variant: 'destructive',
      icon: <X className="h-4 w-4" />,
    }}
  />
);

export default FormActions;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'card' | 'bordered' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  required?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  actions?: React.ReactNode;
  showSeparator?: boolean;
  separatorClassName?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
  cardClassName = '',
  headerClassName = '',
  contentClassName = '',
  variant = 'default',
  size = 'md',
  icon: Icon,
  badge,
  badgeVariant = 'default',
  required = false,
  collapsible = false,
  defaultCollapsed = false,
  onToggle,
  actions,
  showSeparator = true,
  separatorClassName = '',
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      const newCollapsed = !collapsed;
      setCollapsed(newCollapsed);
      onToggle?.(newCollapsed);
    }
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const descriptionSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderHeader = () => {
    if (!title && !description && !actions) return null;

    return (
      <div className={cn('flex items-start justify-between', headerClassName)}>
        <div className="flex-1">
          {title && (
            <div className="flex items-center space-x-2 mb-2">
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              <h3 className={cn('font-semibold', titleSizes[size])}>
                {title}
                {required && <span className="text-destructive ml-1">*</span>}
              </h3>
              {badge && (
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
          )}
          {description && (
            <p className={cn('text-muted-foreground', descriptionSizes[size])}>
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {actions}
          {collapsible && (
            <button
              onClick={handleToggle}
              className="p-1 hover:bg-muted rounded-md transition-colors"
              aria-label={collapsed ? 'Expand section' : 'Collapse section'}
            >
              <svg
                className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (collapsible && collapsed) return null;

    return (
      <div className={cn('space-y-4', contentClassName)}>
        {children}
      </div>
    );
  };

  const renderSeparator = () => {
    if (!showSeparator) return null;

    return (
      <Separator className={separatorClassName} />
    );
  };

  // Minimal variant - just a div with spacing
  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-4', className)}>
        {renderHeader()}
        {renderContent()}
        {renderSeparator()}
      </div>
    );
  }

  // Bordered variant - div with border
  if (variant === 'bordered') {
    return (
      <div className={cn('border rounded-lg p-4 space-y-4', className)}>
        {renderHeader()}
        {renderContent()}
        {renderSeparator()}
      </div>
    );
  }

  // Card variant - wrapped in card
  if (variant === 'card') {
    return (
      <Card className={cn(cardClassName, className)}>
        {(title || description || actions) && (
          <CardHeader className={sizeClasses[size]}>
            {renderHeader()}
          </CardHeader>
        )}
        <CardContent className={cn(sizeClasses[size], contentClassName)}>
          {renderContent()}
        </CardContent>
        {renderSeparator()}
      </Card>
    );
  }

  // Default variant - simple div with background
  return (
    <div className={cn('bg-muted/30 rounded-lg p-4 space-y-4', className)}>
      {renderHeader()}
      {renderContent()}
      {renderSeparator()}
    </div>
  );
};

// Specialized form sections for common use cases
export const PersonalInfoSection: React.FC<Omit<FormSectionProps, 'title' | 'icon'>> = ({
  children,
  ...props
}) => (
  <FormSection
    title="Personal Information"
    icon={require('lucide-react').User}
    description="Enter your personal details"
    {...props}
  >
    {children}
  </FormSection>
);

export const ContactInfoSection: React.FC<Omit<FormSectionProps, 'title' | 'icon'>> = ({
  children,
  ...props
}) => (
  <FormSection
    title="Contact Information"
    icon={require('lucide-react').Mail}
    description="How can we reach you?"
    {...props}
  >
    {children}
  </FormSection>
);

export const PreferencesSection: React.FC<Omit<FormSectionProps, 'title' | 'icon'>> = ({
  children,
  ...props
}) => (
  <FormSection
    title="Preferences"
    icon={require('lucide-react').Settings}
    description="Customize your experience"
    {...props}
  >
    {children}
  </FormSection>
);

export const EmergencyContactSection: React.FC<Omit<FormSectionProps, 'title' | 'icon'>> = ({
  children,
  ...props
}) => (
  <FormSection
    title="Emergency Contact"
    icon={require('lucide-react').Phone}
    description="Who should we contact in case of emergency?"
    badge="Required"
    badgeVariant="destructive"
    {...props}
  >
    {children}
  </FormSection>
);

export default FormSection;

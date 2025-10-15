import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, AlertCircle, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'date' | 'time' | 'datetime-local' | 'file';
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: (e: React.FocusEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  radioOptions?: Array<{ value: string; label: string; disabled?: boolean }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
  showRequired?: boolean;
  showError?: boolean;
  showHelp?: boolean;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  accept?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  labelClassName = '',
  inputClassName = '',
  options = [],
  radioOptions = [],
  rows = 3,
  min,
  max,
  step,
  pattern,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  size = 'md',
  variant = 'default',
  showLabel = true,
  showRequired = true,
  showError = true,
  showHelp = true,
  icon,
  suffix,
  prefix,
  accept,
}) => {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  const inputSizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
    lg: 'px-4 py-3'
  };

  const handleChange = (newValue: any) => {
    onChange?.(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    handleChange(newValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleChange(file);
  };

  const handleSelectChange = (newValue: string) => {
    handleChange(newValue);
  };

  const handleCheckboxChange = (checked: boolean) => {
    handleChange(checked);
  };

  const handleRadioChange = (newValue: string) => {
    handleChange(newValue);
  };

  const handleSwitchChange = (checked: boolean) => {
    handleChange(checked);
  };

  const handleDateChange = (date: Date | undefined) => {
    handleChange(date);
  };

  const renderInput = () => {
    const baseInputProps = {
      id: name,
      name,
      value: value || '',
      onChange: handleInputChange,
      onBlur,
      onFocus,
      placeholder,
      required,
      disabled,
      autoFocus,
      readOnly,
      className: cn(
        sizeClasses[size],
        inputSizeClasses[size],
        error && 'border-destructive focus:border-destructive',
        inputClassName
      ),
      ...(type === 'number' && { min, max, step }),
      ...(pattern && { pattern }),
      ...(autoComplete && { autoComplete }),
    };

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...baseInputProps}
            rows={rows}
            className={cn(baseInputProps.className, 'resize-none')}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={handleSelectChange} disabled={disabled}>
            <SelectTrigger className={cn(sizeClasses[size], baseInputProps.className)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={Boolean(value)}
              onCheckedChange={handleCheckboxChange}
              disabled={disabled}
              required={required}
            />
            <Label htmlFor={name} className={cn('text-sm font-medium', labelClassName)}>
              {label}
              {required && showRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup value={value || ''} onValueChange={handleRadioChange}>
            {radioOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  disabled={disabled || option.disabled}
                />
                <Label htmlFor={`${name}-${option.value}`} className="text-sm font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={Boolean(value)}
              onCheckedChange={handleSwitchChange}
              disabled={disabled}
            />
            <Label htmlFor={name} className={cn('text-sm font-medium', labelClassName)}>
              {label}
              {required && showRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                  sizeClasses[size],
                  baseInputProps.className
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value, 'PPP') : <span>{placeholder}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateChange}
                disabled={disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'file':
        return (
          <div className="relative">
            {prefix && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {prefix}
              </div>
            )}
            <Input
              {...baseInputProps}
              type="file"
              onChange={handleFileChange}
              className={cn(
                baseInputProps.className,
                prefix && 'pl-10',
                suffix && 'pr-10'
              )}
              accept={accept}
            />
            {suffix && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {suffix}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="relative">
            {prefix && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {prefix}
              </div>
            )}
            <Input
              {...baseInputProps}
              type={type}
              className={cn(
                baseInputProps.className,
                prefix && 'pl-10',
                suffix && 'pr-10'
              )}
            />
            {suffix && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {suffix}
              </div>
            )}
          </div>
        );
    }
  };

  // For checkbox and switch, we don't need a separate label
  if (type === 'checkbox' || type === 'switch') {
    return (
      <div className={cn('space-y-2', className)}>
        {renderInput()}
        {showError && error && (
          <div className="flex items-center space-x-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {showHelp && helpText && (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>{helpText}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <Label htmlFor={name} className={cn('text-sm font-medium', labelClassName)}>
          {label}
          {required && showRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {icon && (
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
          <div className="pl-10">
            {renderInput()}
          </div>
        </div>
      )}
      
      {!icon && renderInput()}
      
      {showError && error && (
        <div className="flex items-center space-x-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {showHelp && helpText && (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          <span>{helpText}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;

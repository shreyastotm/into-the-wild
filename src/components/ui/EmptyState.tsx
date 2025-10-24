import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  image?: string;
  imageAlt?: string;
  variant?: "default" | "minimal" | "card" | "illustrated";
  size?: "sm" | "md" | "lg";
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className = "",
  icon: Icon,
  image,
  imageAlt = "Empty state illustration",
  variant = "default",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "py-8",
    md: "py-16",
    lg: "py-24",
  };

  const iconSizes = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const descriptionSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const renderContent = () => (
    <div className={`text-center px-4 ${sizeClasses[size]} ${className}`}>
      {/* Icon or Image */}
      <div className="inline-block relative mb-6">
        {image ? (
          <img
            src={image}
            alt={imageAlt}
            className={`${iconSizes[size]} w-auto opacity-15 grayscale`}
          />
        ) : Icon ? (
          <Icon
            className={`${iconSizes[size]} text-muted-foreground mx-auto`}
          />
        ) : (
          <img
            src="/itw_logo.png"
            alt="Into the Wild"
            className={`${iconSizes[size]} w-auto opacity-15 grayscale`}
          />
        )}
        {variant === "default" && (
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent"></div>
        )}
      </div>

      {/* Title */}
      <h3 className={`${titleSizes[size]} font-semibold text-gray-900 mb-2`}>
        {title}
      </h3>

      {/* Description */}
      <p
        className={`${descriptionSizes[size]} text-gray-600 mb-6 max-w-md mx-auto`}
      >
        {description}
      </p>

      {/* Action */}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );

  // Minimal variant - no background styling
  if (variant === "minimal") {
    return renderContent();
  }

  // Card variant - wrapped in card
  if (variant === "card") {
    return (
      <Card>
        <CardContent className="p-0">{renderContent()}</CardContent>
      </Card>
    );
  }

  // Illustrated variant - with more visual emphasis
  if (variant === "illustrated") {
    return (
      <div className={`text-center px-4 ${sizeClasses[size]} ${className}`}>
        <div className="relative mb-8">
          {image ? (
            <img
              src={image}
              alt={imageAlt}
              className={`${iconSizes[size]} w-auto mx-auto`}
            />
          ) : Icon ? (
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8 inline-block">
              <Icon className={`${iconSizes[size]} text-primary`} />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8 inline-block">
              <img
                src="/itw_logo.png"
                alt="Into the Wild"
                className={`${iconSizes[size]} w-auto`}
              />
            </div>
          )}
        </div>

        <h3 className={`${titleSizes[size]} font-semibold text-gray-900 mb-3`}>
          {title}
        </h3>

        <p
          className={`${descriptionSizes[size]} text-gray-600 mb-8 max-w-lg mx-auto`}
        >
          {description}
        </p>

        {action && <div className="flex justify-center">{action}</div>}
      </div>
    );
  }

  // Default variant
  return renderContent();
};

export default EmptyState;

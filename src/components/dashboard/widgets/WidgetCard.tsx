import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WidgetCardProps {
  title: string;
  navigateTo?: string;
  isResizeMode?: boolean;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const WidgetCard = ({
  title,
  navigateTo,
  isResizeMode = false,
  headerAction,
  children,
  className = "",
}: WidgetCardProps) => {
  const navigate = useNavigate();

  const handleTitleClick = () => {
    if (!isResizeMode && navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <Card className={`h-full hover:shadow-lg transition-shadow animate-fade-in overflow-hidden flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3 flex-shrink-0">
        <CardTitle
          className={`text-sm font-medium truncate ${
            navigateTo && !isResizeMode
              ? "cursor-pointer hover:text-primary transition-colors"
              : ""
          }`}
          onClick={handleTitleClick}
        >
          {title}
        </CardTitle>
        {headerAction && (
          <div className="flex-shrink-0">{headerAction}</div>
        )}
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 flex-1 min-h-0 flex flex-col">
        {children}
      </CardContent>
    </Card>
  );
};

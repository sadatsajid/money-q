import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">{title}</h1>
        {description && (
          <div className="text-sm sm:text-base text-muted-foreground">
            {typeof description === "string" ? <p>{description}</p> : description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}


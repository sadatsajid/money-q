import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { getIncomeMetadata } from "@/constants/income";
import type { Income } from "@/lib/hooks/use-income";

interface IncomeItemProps {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export function IncomeItem({ income, onEdit, onDelete }: IncomeItemProps) {
  const metadata = getIncomeMetadata(income.source);
  
  // Convert hex color to RGB for background opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 16, g: 185, h: 129 }; // default emerald
  };

  const rgb = hexToRgb(metadata.color);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  
  return (
    <div className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-sm gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div 
          className="flex-shrink-0 rounded-lg p-2.5"
          style={{ backgroundColor: bgColor }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: metadata.color }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 truncate">{income.source}</p>
            <span 
              className="flex-shrink-0 text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: bgColor, 
                color: metadata.color 
              }}
            >
              {metadata.group}
            </span>
            <span className="flex-shrink-0 text-xs text-gray-500">
              {formatDate(income.date)}
            </span>
          </div>
          {income.note && (
            <p className="text-sm text-gray-500 truncate">{income.note}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p 
            className="text-lg font-bold"
            style={{ color: metadata.color }}
          >
            +{formatMoney(income.amount, income.currency)}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(income)}
            className="h-8 w-8 hover:bg-gray-100"
          >
            <Edit2 className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(income.id)}
            className="h-8 w-8 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}


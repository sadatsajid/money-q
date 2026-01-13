import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

interface CategoryData {
  categoryId: string;
  categoryName: string;
  total: string;
  percentage: number;
}

interface CategoryBreakdownProps {
  categories: CategoryData[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const topCategories = categories.slice(0, 5);
  const colors = [
    "from-emerald-500 to-green-600",
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Top 5 categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCategories.map((category, index) => {
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={category.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {category.categoryName}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatMoney(parseFloat(category.total), "BDT")}
                  </span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out shadow-sm`}
                    style={{ 
                      width: `${category.percentage}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500">
                    {category.percentage.toFixed(1)}% of total
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


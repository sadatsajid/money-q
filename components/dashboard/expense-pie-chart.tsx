import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatMoney } from "@/lib/money";
import { TrendingUp, DollarSign } from "lucide-react";

interface CategoryData {
  categoryId: string;
  categoryName: string;
  total: string;
  percentage: number;
}

interface ExpensePieChartProps {
  categories: CategoryData[];
  totalExpenses: string;
}

// Color palette for the pie chart
const COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#8b5cf6", // purple-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
];

const RADIAN = Math.PI / 180;

// Custom label function to show percentage on slices
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is >= 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ExpensePieChart({ categories, totalExpenses }: ExpensePieChartProps) {
  if (categories.length === 0) {
    return null;
  }

  // Prepare data for the pie chart
  const chartData = categories.map((cat, index) => ({
    name: cat.categoryName,
    value: parseFloat(cat.total),
    percentage: cat.percentage,
    color: COLORS[index % COLORS.length],
  }));

  // Find top category
  const topCategory = categories[0];
  const totalExpensesNum = parseFloat(totalExpenses);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatMoney(data.value, "BDT")}
          </p>
          <p className="text-xs text-gray-500">
            {data.percentage.toFixed(1)}% of total expenses
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {payload.map((entry: any, index: number) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50"
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {entry.value}
              </p>
              <p className="text-xs text-gray-500">
                {formatMoney(entry.payload.value, "BDT")}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-100 p-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              Expense Distribution
            </CardTitle>
            <CardDescription className="mt-1">
              Visual breakdown of spending by category
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Insights Section */}
          <div className="grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Expenses</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatMoney(totalExpensesNum, "BDT")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Top Category</p>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {topCategory.categoryName}
                </p>
                <p className="text-xs text-gray-500">
                  {topCategory.percentage.toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {chartData.map((entry, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={entry.color}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={entry.color}
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <Legend content={renderCustomLegend} />
        </div>
      </CardContent>
    </Card>
  );
}

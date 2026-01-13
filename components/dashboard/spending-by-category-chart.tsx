import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoney } from "@/lib/money";

interface CategoryData {
  categoryId: string;
  categoryName: string;
  total: string;
  percentage: number;
}

interface SpendingByCategoryChartProps {
  categories: CategoryData[];
}

export function SpendingByCategoryChart({ categories }: SpendingByCategoryChartProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Top expense categories this month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={categories}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="categoryName"
              tick={{ 
                fontSize: 12, 
                fill: "#6b7280",
                fontWeight: 500
              }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ 
                fontSize: 12, 
                fill: "#6b7280",
                fontWeight: 500
              }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                padding: "12px",
              }}
              labelStyle={{
                color: "#111827",
                fontWeight: 600,
                marginBottom: "4px",
              }}
              itemStyle={{
                color: "#059669",
                fontWeight: 600,
              }}
              formatter={(value: number | undefined) => formatMoney(value ?? 0, "BDT")}
              cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
            />
            <Bar
              dataKey="total"
              fill="url(#barGradient)"
              name="Amount"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


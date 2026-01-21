// AI Insights feature temporarily disabled
"use client";

/* 
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw, Lightbulb, Info, AlertCircle, TrendingUp } from "lucide-react";
import { getCurrentMonth, getMonthName } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { MonthPicker } from "@/components/ui/month-picker";

type Insight = {
  id: string;
  month: string;
  content: string;
  createdAt: string;
};
*/

export default function InsightsPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Insights</h1>
        <p className="text-gray-600">This feature is temporarily disabled.</p>
      </div>
    </div>
  );

  /* 
  export default function InsightsPage() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    fetchInsight();
  }, [selectedMonth]);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/insights?month=${selectedMonth}`);
      if (response.ok) {
        const { insight } = await response.json();
        setInsight(insight);
      }
    } catch (error) {
      console.error("Error fetching insight:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth }),
      });

      if (response.ok) {
        const { insight } = await response.json();
        setInsight(insight);
      } else {
        const { error } = await response.json();
        toast.error(error || "Failed to generate insights");
      }
    } catch (error) {
      console.error("Error generating insight:", error);
      toast.error("Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Insights</h1>
          </div>
          <p className="text-sm text-gray-600">
            AI-powered financial analysis and personalized recommendations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MonthPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
            className="w-full sm:w-48"
          />
          <Button
            onClick={generateInsight}
            disabled={generating || loading}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">Generating</span>
              </>
            ) : (
              <>
                {insight ? <RefreshCw className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                <span className="hidden sm:inline">{insight ? "Regenerate" : "Generate"} Insights</span>
                <span className="sm:hidden">{insight ? "Regenerate" : "Generate"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {loading && !insight ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading insights...</p>
          </div>
        </div>
      ) : !insight ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100">
              <Sparkles className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No insights yet for {getMonthName(selectedMonth)}
            </h3>
            <p className="mb-6 text-sm text-gray-600 max-w-md mx-auto">
              Get personalized financial insights powered by AI. Our system will analyze your spending patterns, income, and savings to provide actionable recommendations.
            </p>
            <Button 
              onClick={generateInsight} 
              disabled={generating}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-green-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 p-2">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Financial Insights for {getMonthName(selectedMonth)}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    Generated on {new Date(insight.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm prose-emerald max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {insight.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About AI Insights */}
      <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-slate-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">About AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">How it works</h4>
                <p className="text-sm text-gray-600">
                  Our AI analyzes your income, expenses, savings patterns, and compares them with previous months to provide personalized recommendations.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-lg bg-green-100 p-2">
                  <Lightbulb className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Bangladesh-specific advice</h4>
                <p className="text-sm text-gray-600">
                  Insights are tailored for Bangladesh, considering local investment options like NSC, Sanchayapatra, and typical living costs.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-lg bg-amber-100 p-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Disclaimer</h4>
                <p className="text-sm text-gray-600">
                  AI insights are advisory only and should not be considered as guaranteed financial advice. Always consult with a qualified financial advisor for major decisions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  */
}


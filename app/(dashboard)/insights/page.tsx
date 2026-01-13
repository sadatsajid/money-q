"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Insights</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            AI-powered financial analysis and recommendations
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
            className="w-full sm:w-auto"
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
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : !insight ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary-600" />
            <h3 className="mb-2 text-lg font-semibold">
              No insights yet for {getMonthName(selectedMonth)}
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Generate AI-powered insights based on your financial data
            </p>
            <Button onClick={generateInsight} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Financial Insights for {getMonthName(selectedMonth)}</CardTitle>
            <CardDescription>
              Generated on {new Date(insight.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {insight.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              <strong>How it works:</strong> Our AI analyzes your income, expenses, savings patterns, and compares them with previous months to provide personalized recommendations.
            </p>
            <p>
              <strong>Bangladesh-specific advice:</strong> Insights are tailored for Bangladesh, considering local investment options like NSC, Sanchayapatra, and typical living costs.
            </p>
            <p>
              <strong>Disclaimer:</strong> AI insights are advisory only and should not be considered as guaranteed financial advice. Always consult with a qualified financial advisor for major decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


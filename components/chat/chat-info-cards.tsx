import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChatInfoCards() {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">🎯 Budget Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Ask about your spending vs. budget in different categories
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">💰 Savings Advice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Get personalized tips to increase your savings rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">📊 Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Understand where your money goes and identify patterns
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


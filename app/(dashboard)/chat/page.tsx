"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm MoneyQ AI, your personal financial advisor. I can help you understand your spending patterns, give advice on budgeting, and answer questions about your finances. What would you like to know?",
      },
    ],
  });

  const suggestedQuestions = [
    "How am I doing with my savings this month?",
    "What category am I spending the most on?",
    "Can I afford a ৳50,000 purchase?",
    "How can I improve my savings rate?",
    "What are my spending patterns?",
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-primary-900">
          <Sparkles className="h-8 w-8 text-primary-600" />
          AI Financial Advisor
        </h1>
        <p className="text-muted-foreground">
          Get personalized insights and advice based on your financial data
        </p>
      </div>

      {/* Chat messages */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full p-0">
          <div className="flex h-full flex-col">
            {/* Messages container */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {messages.length === 1 && messages[0].id === "welcome" && (
                <div className="mb-6">
                  <p className="mb-4 text-sm text-muted-foreground">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleInputChange({
                            target: { value: question },
                          } as any);
                        }}
                        className="text-left"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                      <Bot className="h-5 w-5 text-primary-700" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                    <Bot className="h-5 w-5 text-primary-700" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me anything about your finances..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                💡 Tip: Ask specific questions about your spending, savings, or budget
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
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
    </div>
  );
}


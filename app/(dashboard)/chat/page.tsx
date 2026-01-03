"use client";

import { useChat } from "ai/react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatLoading } from "@/components/chat/chat-loading";
import { ChatInput } from "@/components/chat/chat-input";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { ChatInfoCards } from "@/components/chat/chat-info-cards";

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

  const handleQuestionClick = (question: string) => {
    handleInputChange({
      target: { value: question },
    } as any);
  };

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
                <SuggestedQuestions onQuestionClick={handleQuestionClick} />
              )}

              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}

              {isLoading && <ChatLoading />}
            </div>

            {/* Input form */}
            <ChatInput
              input={input}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <ChatInfoCards />
    </div>
  );
}


"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatLoading } from "@/components/chat/chat-loading";
import { ChatInput } from "@/components/chat/chat-input";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { ChatInfoCards } from "@/components/chat/chat-info-cards";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    api: "/api/ai/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm MoneyQ AI, your personal financial advisor. I can help you understand your spending patterns, give advice on budgeting, and answer questions about your finances. What would you like to know?",
      },
    ],
  } as any);

  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    sendMessage({ role: "user", content: userMessage } as any);
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-primary-900">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 flex-shrink-0" />
          <span className="truncate">AI Financial Advisor</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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

              {messages.map((message: any) => {
                // Extract content from UIMessage - handle different content types
                const content = 
                  message.content && typeof message.content === "string"
                    ? message.content
                    : message.content && Array.isArray(message.content)
                      ? message.content.map((part: any) => 
                          typeof part === 'string' ? part : part.text || ''
                        ).join('')
                      : "";

                return (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    role={message.role}
                    content={content}
                  />
                );
              })}

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


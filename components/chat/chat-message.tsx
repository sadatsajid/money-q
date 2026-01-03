import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  const isAssistant = role === "assistant" || role === "system" || role === "data";
  
  return (
    <div
      className={`flex gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {isAssistant && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
          <Bot className="h-5 w-5 text-primary-700" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-primary-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>

      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
}


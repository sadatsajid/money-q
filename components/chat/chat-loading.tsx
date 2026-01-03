import { Loader2, Bot } from "lucide-react";

export function ChatLoading() {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
        <Bot className="h-5 w-5 text-primary-700" />
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Thinking...</span>
      </div>
    </div>
  );
}


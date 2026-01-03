import { Button } from "@/components/ui/button";
import { SUGGESTED_QUESTIONS } from "@/constants/chat";

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({
  onQuestionClick,
}: SuggestedQuestionsProps) {
  return (
    <div className="mb-6">
      <p className="mb-4 text-sm text-muted-foreground">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            className="text-left"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}


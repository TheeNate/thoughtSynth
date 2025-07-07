import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2 } from "lucide-react";

interface ProcessingIndicatorProps {
  isVisible: boolean;
  progress?: number;
  stage?: string;
}

export default function ProcessingIndicator({ 
  isVisible, 
  progress = 60, 
  stage = "Analyzing with AI and extracting insights..." 
}: ProcessingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <Card className="bg-card dark:bg-dark-surface border-border dark:border-dark-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <Brain className="h-4 w-4 text-primary absolute inset-0 m-auto" />
          </div>
          <div className="text-center">
            <p className="text-foreground dark:text-white font-medium">
              Processing Content
            </p>
            <p className="text-muted-foreground dark:text-gray-400 text-sm mt-1">
              {stage}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="w-full h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground dark:text-gray-400">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            This may take a few moments depending on content length
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

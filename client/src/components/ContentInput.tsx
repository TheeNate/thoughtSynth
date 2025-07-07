import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Link, Save, Brain } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContentInputProps {
  onProcessingStart?: () => void;
  onProcessingComplete?: () => void;
}

export default function ContentInput({ onProcessingStart, onProcessingComplete }: ContentInputProps) {
  const [url, setUrl] = useState("");
  const [takeaways, setTakeaways] = useState("");
  const [contentType, setContentType] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const detectTypeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/content/detect-type", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setContentType(data.contentType);
    },
  });

  const processContentMutation = useMutation({
    mutationFn: async (data: { url: string; userTakeaways?: string }) => {
      const response = await apiRequest("POST", "/api/content/process", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Content Processed",
          description: "Your content has been analyzed and added to your library.",
        });
        setUrl("");
        setTakeaways("");
        setContentType(null);
        queryClient.invalidateQueries({ queryKey: ["/api/content"] });
        onProcessingComplete?.();
      } else {
        toast({
          title: "Processing Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value && value.includes("://")) {
      detectTypeMutation.mutate(value);
    } else {
      setContentType(null);
    }
  };

  const handleProcess = () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to process.",
        variant: "destructive",
      });
      return;
    }

    onProcessingStart?.();
    processContentMutation.mutate({
      url,
      userTakeaways: takeaways || undefined,
    });
  };

  const getContentIcon = (type: string | null) => {
    switch (type) {
      case "article":
        return "📄";
      case "podcast":
        return "🎧";
      case "video":
        return "📺";
      default:
        return "📎";
    }
  };

  return (
    <Card className="bg-card dark:bg-dark-surface border-border dark:border-dark-border">
      <CardContent className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* URL Input */}
          <div className="space-y-4">
            <div className="relative">
              <Link className="absolute left-4 top-4 h-5 w-5 text-muted-foreground dark:text-gray-400" />
              <Input
                type="url"
                placeholder="Paste any link: article, podcast, video..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="pl-12 pr-16 py-4 text-lg bg-background dark:bg-dark-bg border-border dark:border-dark-border text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-400"
              />
              <div className="absolute right-4 top-4 text-2xl">
                {getContentIcon(contentType)}
              </div>
            </div>

            {/* Content Type Indicators */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Articles</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Podcasts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Videos</span>
              </div>
            </div>
          </div>

          {/* User Takeaways */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground dark:text-gray-300">
              Your takeaways and thoughts
            </label>
            <Textarea
              placeholder="What insights did you gain? What questions do you have? How does this connect to your existing knowledge?"
              value={takeaways}
              onChange={(e) => setTakeaways(e.target.value)}
              rows={6}
              className="resize-none bg-background dark:bg-dark-bg border-border dark:border-dark-border text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleProcess}
              disabled={processContentMutation.isPending || !url}
              className="bg-primary hover:bg-primary/90 text-primary-foreground space-x-2"
            >
              <Brain className="h-4 w-4" />
              <span>{processContentMutation.isPending ? "Processing..." : "Process Content"}</span>
            </Button>
            <Button
              variant="secondary"
              className="bg-muted dark:bg-dark-border hover:bg-muted/80 dark:hover:bg-dark-border/80 text-muted-foreground dark:text-gray-300 space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

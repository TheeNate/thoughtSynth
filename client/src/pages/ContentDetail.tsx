import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Headphones, 
  Play, 
  ExternalLink, 
  Tag, 
  Share, 
  Bot,
  User,
  Quote
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function ContentDetail() {
  const { id } = useParams();
  const [takeawayText, setTakeawayText] = useState("");
  const { toast } = useToast();

  const { data: content, isLoading, error } = useQuery({
    queryKey: [`/api/content/${id}`],
    enabled: !!id,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (content?.takeaways?.[0]) {
      setTakeawayText(content.takeaways[0].takeawayText || "");
    }
  }, [content]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case "podcast":
        return <Headphones className="h-5 w-5 text-green-500" />;
      case "video":
        return <Play className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " • " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-background dark:bg-dark-bg">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-background dark:bg-dark-bg">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">
                  Content Not Found
                </h2>
                <p className="text-muted-foreground dark:text-gray-400">
                  The content you're looking for doesn't exist or you don't have permission to view it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="min-h-screen flex bg-background dark:bg-dark-bg">
      <Sidebar />
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-muted/20 dark:bg-gray-800/20 rounded-lg flex items-center justify-center">
              {getContentIcon(content.contentType)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground dark:text-white">
                {content.title}
              </h1>
              <p className="text-muted-foreground dark:text-gray-400">
                <a 
                  href={content.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center space-x-1"
                >
                  <span>{new URL(content.url).hostname}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="mx-2">•</span>
                <span>{formatDate(content.createdAt)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-muted dark:bg-dark-border hover:bg-muted/80 dark:hover:bg-dark-border/80 text-muted-foreground dark:text-gray-300"
            >
              <Tag className="h-4 w-4 mr-2" />
              Add Tags
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {content.tags.map((tag: any) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {tag.tagName}
              </Badge>
            ))}
          </div>
        )}

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Analysis Column */}
          <div className="lg:col-span-4">
            <Card className="bg-background dark:bg-dark-bg border-border dark:border-dark-border h-full">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-white flex items-center">
                  <Bot className="h-5 w-5 text-accent mr-2" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.aiAnalysis ? (
                  <>
                    {/* Core Concepts */}
                    {content.aiAnalysis.coreConcepts && content.aiAnalysis.coreConcepts.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-foreground dark:text-gray-300 mb-2">
                          Core Concepts
                        </h5>
                        <ul className="text-sm text-muted-foreground dark:text-gray-400 space-y-1">
                          {content.aiAnalysis.coreConcepts.map((concept: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{concept}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Insights */}
                    {content.aiAnalysis.keyInsights && content.aiAnalysis.keyInsights.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-foreground dark:text-gray-300 mb-2">
                          Key Insights
                        </h5>
                        <ul className="text-sm text-muted-foreground dark:text-gray-400 space-y-2">
                          {content.aiAnalysis.keyInsights.map((insight: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notable Quotes */}
                    {content.aiAnalysis.notableQuotes && content.aiAnalysis.notableQuotes.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-foreground dark:text-gray-300 mb-2">
                          Notable Quotes
                        </h5>
                        <div className="space-y-2">
                          {content.aiAnalysis.notableQuotes.map((quote: string, index: number) => (
                            <blockquote key={index} className="text-sm text-muted-foreground dark:text-gray-400 italic border-l-2 border-accent pl-3">
                              <Quote className="h-3 w-3 inline mr-1" />
                              {quote}
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {content.aiAnalysis.summary && (
                      <div>
                        <h5 className="text-sm font-medium text-foreground dark:text-gray-300 mb-2">
                          Summary
                        </h5>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                          {content.aiAnalysis.summary}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-muted-foreground dark:text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground dark:text-gray-400">
                      No AI analysis available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Takeaways Column */}
          <div className="lg:col-span-4">
            <Card className="bg-background dark:bg-dark-bg border-border dark:border-dark-border h-full">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-white flex items-center">
                  <User className="h-5 w-5 text-primary mr-2" />
                  Your Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={takeawayText}
                  onChange={(e) => setTakeawayText(e.target.value)}
                  placeholder="Add your thoughts and insights..."
                  className="min-h-[300px] resize-none bg-background dark:bg-dark-surface border-border dark:border-dark-border text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-400"
                />
                <div className="mt-4">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Column */}
          <div className="lg:col-span-4">
            <ChatPanel contentId={parseInt(id!)} />
          </div>

        </div>
      </div>
    </div>
  );
}

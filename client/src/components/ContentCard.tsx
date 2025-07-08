import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Headphones, Play, MessageSquare, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ContentCardProps {
  content: {
    id: number;
    title: string;
    url: string;
    contentType: string;
    aiAnalysis?: any;
    createdAt: string;
    userTakeaway?: string;
    tags?: string[];
    commentCount?: number;
  };
  onDelete?: (contentId: number) => void;
}

export default function ContentCard({ content, onDelete }: ContentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      await apiRequest(`/api/content/${content.id}`, {
        method: "DELETE",
      });
      
      // Invalidate the content list cache
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      
      if (onDelete) {
        onDelete(content.id);
      }
      
      toast({
        title: "Content deleted",
        description: "The content has been successfully removed from your library.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article":
        return "hover:border-yellow-500/50";
      case "podcast":
        return "hover:border-green-500/50";
      case "video":
        return "hover:border-red-500/50";
      default:
        return "hover:border-gray-500/50";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "Unknown";
    }
  };

  return (
    <Card className={`bg-background dark:bg-dark-bg border-border dark:border-dark-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${getTypeColor(content.contentType)}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-muted/20 dark:bg-gray-800/20 rounded-lg flex items-center justify-center">
            {getContentIcon(content.contentType)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground dark:text-white truncate">
              {content.title}
            </h4>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              {getDomain(content.url)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className="text-xs bg-muted/20 dark:bg-gray-800/20 text-muted-foreground dark:text-gray-400"
            >
              {content.contentType}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Takeaway Preview */}
        {content.userTakeaway && (
          <p className="text-sm text-foreground dark:text-gray-300 mb-4 line-clamp-3">
            {content.userTakeaway}
          </p>
        )}

        {/* AI Analysis Preview */}
        {content.aiAnalysis?.summary && (
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 line-clamp-2">
            {content.aiAnalysis.summary}
          </p>
        )}

        {/* Tags */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 flex-wrap">
            {content.aiAnalysis?.tags?.slice(0, 2).map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-primary/10 text-primary border-primary/20"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Link href={`/content/${content.id}`}>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              Open Discussion
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border dark:border-dark-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-gray-500">
            <span>{formatDate(content.createdAt)}</span>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span>{content.commentCount || 0} comments</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

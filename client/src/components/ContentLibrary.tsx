import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, List, FileText, Headphones, Play } from "lucide-react";
import ContentCard from "./ContentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

export default function ContentLibrary() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: contentItems, isLoading } = useQuery({
    queryKey: ["/api/content"],
  });

  const filteredContent = contentItems?.filter((item: any) => {
    if (filterType === "all") return true;
    return item.contentType === filterType;
  }) || [];

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case "podcast":
        return <Headphones className="h-4 w-4 text-green-500" />;
      case "video":
        return <Play className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContentCounts = () => {
    if (!contentItems) return { total: 0, articles: 0, podcasts: 0, videos: 0 };
    
    return {
      total: contentItems.length,
      articles: contentItems.filter((item: any) => item.contentType === "article").length,
      podcasts: contentItems.filter((item: any) => item.contentType === "podcast").length,
      videos: contentItems.filter((item: any) => item.contentType === "video").length,
    };
  };

  const counts = getContentCounts();

  if (isLoading) {
    return (
      <Card className="bg-card dark:bg-dark-surface border-border dark:border-dark-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card dark:bg-dark-surface border-border dark:border-dark-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground dark:text-white">
              Content Library
            </CardTitle>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
              {counts.total} items • {counts.articles} articles • {counts.podcasts} podcasts • {counts.videos} videos
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-yellow-500" />
                    <span>Articles</span>
                  </div>
                </SelectItem>
                <SelectItem value="podcast">
                  <div className="flex items-center space-x-2">
                    <Headphones className="h-4 w-4 text-green-500" />
                    <span>Podcasts</span>
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-red-500" />
                    <span>Videos</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/20 dark:bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">
              No content found
            </h3>
            <p className="text-muted-foreground dark:text-gray-400">
              {filterType === "all" 
                ? "Start by adding some content to your library."
                : `No ${filterType}s found. Try a different filter.`
              }
            </p>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredContent.map((content: any) => (
              <ContentCard key={content.id} content={content} onDelete={() => {
                // Refetch content list after deletion
                queryClient.invalidateQueries({ queryKey: ['/api/content'] });
              }} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

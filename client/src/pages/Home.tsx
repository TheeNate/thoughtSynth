import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ContentInput from "@/components/ContentInput";
import ContentLibrary from "@/components/ContentLibrary";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Settings } from "lucide-react";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex bg-background dark:bg-dark-bg">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card dark:bg-dark-surface border-b border-border dark:border-dark-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground dark:text-white">
                Add New Content
              </h2>
              <p className="text-muted-foreground dark:text-gray-400 mt-1">
                Process articles, podcasts, or videos with AI analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search your knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-background dark:bg-dark-bg border-border dark:border-dark-border text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-400"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg bg-muted dark:bg-dark-border hover:bg-muted/80 dark:hover:bg-dark-border/80"
              >
                <Settings className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <ContentInput
            onProcessingStart={() => setIsProcessing(true)}
            onProcessingComplete={() => setIsProcessing(false)}
          />
          
          <ProcessingIndicator isVisible={isProcessing} />
          
          <ContentLibrary />
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

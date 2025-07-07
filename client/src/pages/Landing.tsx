import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, MessageSquare, Search, Zap, Sparkles, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted dark:from-background dark:via-card dark:to-muted relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse floating"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse floating" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse floating" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 mb-6 text-sm bg-primary/10 dark:bg-primary/20 text-primary rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="font-medium">AI-Powered Knowledge Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="gradient-text">Knowledge Synthesis</span>
            <br />
            <span className="text-foreground dark:text-white">Hub</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform your learning with AI-powered content analysis, collaborative discussions, and intelligent knowledge synthesis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-elevated group"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-2 hover:bg-muted/50 dark:hover:bg-muted/20"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            {
              icon: Brain,
              title: "AI Analysis",
              description: "Intelligent content processing and insight extraction",
              gradient: "from-purple-500/20 to-blue-500/20",
              iconColor: "text-purple-500"
            },
            {
              icon: MessageSquare,
              title: "Collaborative Chat",
              description: "Real-time discussions with team members and AI",
              gradient: "from-blue-500/20 to-cyan-500/20",
              iconColor: "text-blue-500"
            },
            {
              icon: Search,
              title: "Smart Search",
              description: "Semantic search across your knowledge base",
              gradient: "from-cyan-500/20 to-teal-500/20",
              iconColor: "text-cyan-500"
            },
            {
              icon: Zap,
              title: "Quick Processing",
              description: "Instant content analysis for articles, podcasts, and videos",
              gradient: "from-teal-500/20 to-green-500/20",
              iconColor: "text-teal-500"
            }
          ].map((feature, index) => (
            <Card 
              key={feature.title}
              className={`glass-card hover:shadow-elevated group transition-all duration-500 animate-fade-in-up border-0 bg-gradient-to-br ${feature.gradient}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                <CardTitle className="text-foreground dark:text-white text-xl font-bold">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="text-center animate-fade-in-up">
          <Card className="glass-card border-0 max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
            <CardHeader className="pb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground dark:text-white mb-4">
                Ready to Transform Your Learning?
              </CardTitle>
              <CardDescription className="text-lg md:text-xl text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Join thousands of learners who are already using AI to enhance their knowledge synthesis and accelerate their understanding.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-10 py-4 text-lg font-semibold shadow-elevated group"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Sign In to Continue
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"></div>
                    ))}
                  </div>
                  <span>5,000+ active learners</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

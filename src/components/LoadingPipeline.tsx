import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Stage {
  name: string;
  description: string;
}

const stages: Stage[] = [
  { name: "Code Parsed", description: "Parsing C code structure" },
  { name: "Syntax Analysis", description: "Checking syntax correctness" },
  { name: "Semantic Analysis", description: "Analyzing logic and meaning" },
  { name: "AI Processing", description: "Generating insights with AI" },
];

interface LoadingPipelineProps {
  currentStage: number;
}

export const LoadingPipeline = ({ currentStage }: LoadingPipelineProps) => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Analysis Pipeline
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Processing your code through multiple stages</p>
        </div>
        
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isComplete = index < currentStage;
            const isActive = index === currentStage;
            const isPending = index > currentStage;

            return (
              <div
                key={stage.name}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                  isActive ? "bg-primary/10 border border-primary/30 scale-105" : ""
                } ${isComplete ? "opacity-70" : ""}`}
              >
                <div className="flex-shrink-0">
                  {isComplete && (
                    <CheckCircle2 className="h-6 w-6 text-success animate-in zoom-in" />
                  )}
                  {isActive && (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  )}
                  {isPending && (
                    <Circle className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${isActive ? "text-primary" : ""}`}>
                    {stage.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stage.description}
                  </div>
                </div>
                
                {isActive && (
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalysisPanelProps {
  analysis: {
    summary?: string;
    errors?: string[];
    suggestions?: string[];
  } | null;
  loading: boolean;
}

export const AnalysisPanel = ({ analysis, loading }: AnalysisPanelProps) => {
  if (loading) {
    return (
      <Card className="h-full border-border">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your code...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="h-full border-border">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-center">
            Paste your C code and click "Analyze Code" to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {analysis.summary && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-success" />
              Code Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {analysis.summary}
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {analysis.errors && analysis.errors.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Issues Found
              <Badge variant="destructive">{analysis.errors.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <ul className="space-y-2">
                {analysis.errors.map((error, idx) => (
                  <li key={idx} className="text-foreground flex gap-2">
                    <span className="text-destructive">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-warning" />
              Suggestions
              <Badge className="bg-warning/20 text-warning border-warning/30">
                {analysis.suggestions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-foreground flex gap-2">
                    <span className="text-warning">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

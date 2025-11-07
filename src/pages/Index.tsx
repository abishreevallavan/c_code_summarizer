import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/CodeEditor";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { TTSControls } from "@/components/TTSControls";
import { FileUpload } from "@/components/FileUpload";
import { LoadingPipeline } from "@/components/LoadingPipeline";
import { ArduinoControls } from "@/components/ArduinoControls";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Code2, Sparkles } from "lucide-react";
import { useArduinoContext as useArduino } from "@/context/ArduinoContext";
import { LEDState } from "@/hooks/useArduino";


const defaultCode = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [code, setCode] = useState(defaultCode);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const { sendLEDCommand, isConnected } = useArduino();
  
  // LED control function - always call this directly
  const controlArduinoLEDs = async (analysisData: any) => {
    console.log("🚀 controlArduinoLEDs called with:", analysisData);
    
    // Don't check isConnected here - let sendLEDCommand handle it
    // This avoids timing issues where state hasn't updated yet
    
    try {
      if (!analysisData) {
        console.warn("⚠️ No analysis data provided");
        return;
      }
  
      // Extract errors and suggestions - check multiple field names
      const errors = 
        Array.isArray(analysisData.errors) ? analysisData.errors :
        Array.isArray(analysisData.issues) ? analysisData.issues :
        Array.isArray(analysisData.error) ? analysisData.error :
        [];
  
      const suggestions = 
        Array.isArray(analysisData.suggestions) ? analysisData.suggestions :
        Array.isArray(analysisData.hints) ? analysisData.hints :
        Array.isArray(analysisData.suggestion) ? analysisData.suggestion :
        [];
  
      const errorCount = errors.length;
      const suggestionCount = suggestions.length;
  
      console.log("📊 Analysis data extracted:", {
        errorCount,
        suggestionCount,
        errors: errors,
        suggestions: suggestions,
        allKeys: Object.keys(analysisData)
      });
  
      let ledState: LEDState = "green";
  
      // Priority: ERRORS FIRST - if any error exists, ignore suggestions and turn RED
      if (errorCount > 0) {
        ledState = "red";
        console.log(`🔴 RED LED - ${errorCount} error(s) detected (ignoring ${suggestionCount} suggestions)`);
      } else if (suggestionCount > 1) {
        // Only check suggestions if NO errors
        ledState = "yellow";
        console.log(`🟡 YELLOW LED - ${suggestionCount} suggestions (more than 1), no errors`);
      } else {
        // No errors, 0 or 1 suggestion
        ledState = "green";
        console.log(`🟢 GREEN LED - No errors, ${suggestionCount} suggestion(s)`);
      }
  
      console.log(`📤 Sending command to Arduino: ${ledState.toUpperCase()}`);
      console.log(`📤 isConnected state: ${isConnected} (but trying anyway)`);
      
      // Try to send - sendLEDCommand will handle connection check
      await sendLEDCommand(ledState);
      console.log(`✅ LED command sent successfully: ${ledState.toUpperCase()}`);
  
    } catch (error: any) {
      console.error("❌ Failed to control Arduino LEDs:", error);
      console.error("Error details:", error);
      
      // If error is about connection, log it but don't fail completely
      if (error?.message?.includes("not connected") || error?.message?.includes("connection")) {
        console.log("⚠️ Connection issue detected, but Arduino might still be connecting...");
      }
    }
  };

  // Automatically control LEDs when analysis changes OR when Arduino connects
  useEffect(() => {
    console.log("🔄 useEffect triggered:", { 
      hasAnalysis: !!analysis, 
      isConnected,
      analysisKeys: analysis ? Object.keys(analysis) : [],
      analysisErrors: analysis?.errors?.length || 0,
      analysisSuggestions: analysis?.suggestions?.length || 0
    });
    
    // If we have analysis, try to send LED command regardless of isConnected state
    // The sendLEDCommand function will handle connection errors gracefully
    if (analysis) {
      console.log("✅ Analysis available, attempting LED control...");
      console.log("✅ Analysis has:", {
        errors: analysis.errors,
        suggestions: analysis.suggestions,
        errorCount: analysis.errors?.length || 0,
        suggestionCount: analysis.suggestions?.length || 0
      });
      
      // Try immediately and also with delays to handle state timing
      const attempt1 = setTimeout(() => {
        console.log("🚀 Attempt 1: Executing controlArduinoLEDs...");
        controlArduinoLEDs(analysis).catch((err) => {
          console.error("❌ Attempt 1 failed:", err);
        });
      }, 100);
      
      const attempt2 = setTimeout(() => {
        console.log("🚀 Attempt 2: Executing controlArduinoLEDs (backup)...");
        controlArduinoLEDs(analysis).catch((err) => {
          console.error("❌ Attempt 2 failed:", err);
        });
      }, 1000);
      
      return () => {
        clearTimeout(attempt1);
        clearTimeout(attempt2);
      };
    } else {
      console.log("⏳ No analysis available yet...");
    }
  }, [analysis, isConnected]);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to analyze");
      return;
    }

    setLoading(true);
    setAnalysis(null); // Clear previous analysis
    setPipelineStage(0);
    
    try {
      // Simulate pipeline stages with delays for visual effect
      await new Promise(resolve => setTimeout(resolve, 800));
      setPipelineStage(1);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setPipelineStage(2);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setPipelineStage(3);
      
      const { data, error } = await supabase.functions.invoke("analyze-code", {
        body: { code },
      });

      if (error) throw error;

      console.log("📥 Analysis response received:", data);
      console.log("📥 Analysis keys:", Object.keys(data || {}));
      console.log("📥 Analysis errors count:", data?.errors?.length || 0);
      console.log("📥 Analysis suggestions count:", data?.suggestions?.length || 0);
      
      // Set analysis - this will trigger useEffect
      setAnalysis(data);
      toast.success("Code analysis complete!");
      
      // Try calling directly with multiple attempts to handle timing issues
      const attemptLEDControl = async (attempt = 1) => {
        if (isConnected) {
          console.log(`🔌 Attempt ${attempt}: Arduino connected, calling controlArduinoLEDs`);
          try {
            await controlArduinoLEDs(data);
            console.log(`✅ Attempt ${attempt} succeeded!`);
          } catch (err) {
            console.error(`❌ Attempt ${attempt} failed:`, err);
            // Retry once more after delay
            if (attempt === 1) {
              setTimeout(() => attemptLEDControl(2), 1000);
            }
          }
        } else {
          console.log(`⚠️ Attempt ${attempt}: Arduino not connected yet`);
          // If not connected, wait a bit and try again (state might update)
          if (attempt < 3) {
            setTimeout(() => attemptLEDControl(attempt + 1), 500);
          } else {
            console.log("💡 Connect Arduino now and LEDs will update automatically via useEffect!");
          }
        }
      };
      
      // Start attempting LED control
      setTimeout(() => attemptLEDControl(1), 200);
      
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze code");
      
      // Turn on red LED if there's an error in the analysis process
      if (isConnected) {
        try {
          await sendLEDCommand("red");
          console.log("🔴 Sent RED LED for analysis error");
        } catch (err) {
          console.error("❌ Failed to send error LED:", err);
        }
      }
    } finally {
      setLoading(false);
      setPipelineStage(0);
    }
  };
  
  const handleFileLoad = (content: string, filename: string) => {
    setCode(content);
    setFileName(filename);
  };

  const handleSendMessage = async (message: string) => {
    const newMessages = [...messages, { role: "user" as const, content: message }];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: newMessages,
          code: code,
        },
      });

      if (error) throw error;

      setMessages([...newMessages, { role: "assistant" as const, content: data.reply }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 animate-glow">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in slide-in-from-left">
                C Code Summarizer
              </h1>
              <p className="text-muted-foreground">
                AI-powered code summarize with interactive chat assistant
              </p>
              {fileName && (
                <p className="text-sm text-primary mt-1">
                  📄 {fileName}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            size="lg"
            className="gap-2 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
          >
            <Sparkles className="h-5 w-5" />
            {loading ? "Analyzing..." : "Analyze Code"}
          </Button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Left Column - Code Editor */}
          <div className="flex flex-col gap-4 h-full">
            <FileUpload onFileLoad={handleFileLoad} />
            <div className="flex-1 min-h-0">
              <CodeEditor value={code} onChange={(val) => setCode(val || "")} />
            </div>
          </div>

          {/* Right Column - Analysis & Chat */}
          <div className="flex flex-col gap-4 h-full">
            {/* Arduino Controls */}
            <ArduinoControls />
            
            {/* TTS Controls */}
            {analysis?.summary && <TTSControls text={analysis.summary} />}
            
            {/* Loading Pipeline or Analysis Panel */}
            <div className="flex-1 min-h-0 overflow-auto">
              {loading ? (
                <LoadingPipeline currentStage={pipelineStage} />
              ) : (
                <AnalysisPanel analysis={analysis} loading={loading} />
              )}
            </div>

            {/* Chat Panel */}
            <div className="h-[400px]">
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={chatLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

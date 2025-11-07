import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useArduinoContext as useArduino } from "@/context/ArduinoContext";
import { Plug, PlugZap, AlertCircle } from "lucide-react";

export const ArduinoControls = () => {
  const { isConnected, isConnecting, error, connect, disconnect } = useArduino();

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Plug className="h-4 w-4" />
          Arduino Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <PlugZap className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                "Disconnected"
              )}
            </Badge>
          </div>
          {isConnected ? (
            <Button onClick={disconnect} variant="outline" size="sm">
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={connect}
              disabled={isConnecting}
              variant="default"
              size="sm"
            >
              {isConnecting ? "Connecting..." : "Connect Arduino"}
            </Button>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {isConnected && (
          <p className="text-xs text-muted-foreground">
            LEDs will automatically update based on code analysis results
          </p>
        )}
      </CardContent>
    </Card>
  );
};


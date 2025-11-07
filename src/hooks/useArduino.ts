import { useState, useCallback, useEffect } from "react";

export type LEDState = "red" | "yellow" | "green" | "off";

interface UseArduinoReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendLEDCommand: (state: LEDState) => Promise<void>;
}

export const useArduino = (): UseArduinoReturn => {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if port is still open
  const isPortOpen = useCallback(async (port: SerialPort): Promise<boolean> => {
    try {
      // Try to get a reader to check if port is open
      const reader = port.readable?.getReader();
      if (reader) {
        reader.releaseLock();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!("serial" in navigator)) {
      setError("Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Check if we already have a port that might be open
      if (port) {
        const isOpen = await isPortOpen(port);
        if (isOpen) {
          setIsConnecting(false);
          return; // Already connected
        }
      }

      const selectedPort = await navigator.serial.requestPort();
      
      // Check if port is already open
      try {
        await selectedPort.open({ baudRate: 9600 });
      } catch (openError: any) {
        if (openError.name === "InvalidStateError") {
          // Port might already be open, try to close and reopen
          try {
            await selectedPort.close();
            await new Promise(resolve => setTimeout(resolve, 100));
            await selectedPort.open({ baudRate: 9600 });
          } catch (retryError: any) {
            throw new Error(`Failed to open port: ${retryError.message}`);
          }
        } else {
          throw openError;
        }
      }
      
      setPort(selectedPort);
      console.log("Arduino connected successfully");
      
      // Wait a bit for Arduino to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err: any) {
      console.error("Connection error:", err);
      if (err.name === "NotFoundError") {
        setError("No port selected. Please select an Arduino port.");
      } else if (err.name === "SecurityError") {
        setError("Permission denied. Please allow access to the serial port.");
      } else {
        setError(err.message || "Failed to connect to Arduino");
      }
      setPort(null);
    } finally {
      setIsConnecting(false);
    }
  }, [port, isPortOpen]);

  const disconnect = useCallback(async () => {
    if (port) {
      try {
        await port.close();
        console.log("Arduino disconnected");
      } catch (err) {
        console.error("Error closing port:", err);
      }
      setPort(null);
    }
    setError(null);
  }, [port]);

  const sendLEDCommand = useCallback(
    async (state: LEDState) => {
      if (!port) {
        setError("Arduino not connected");
        console.error("❌ No port available");
        return;
      }

      // Verify port is still open
      const isOpen = await isPortOpen(port);
      if (!isOpen) {
        setError("Arduino connection lost. Please reconnect.");
        setPort(null);
        console.error("❌ Port is not open");
        return;
      }

      try {
        const writer = port.writable?.getWriter();
        if (!writer) {
          throw new Error("Cannot get writer - port may be closed");
        }

        // Send command based on LED state
        // Format: "RED", "YELLOW", "GREEN", or "OFF"
        const command = state.toUpperCase() + "\n";
        const encoder = new TextEncoder();
        const data = encoder.encode(command);
        
        console.log(`📤 Sending to Arduino: "${command.trim()}" (${data.length} bytes)`);
        console.log(`📤 Raw bytes:`, Array.from(data));
        
        // Write the command
        await writer.write(data);
        
        // Wait for data to be sent and flushed
        await writer.ready;
        
        // Additional delay to ensure Arduino processes the command
        await new Promise(resolve => setTimeout(resolve, 150));
        
        writer.releaseLock();
        console.log(`✅✅✅ Command sent and flushed: "${command.trim()}"`);
        setError(null); // Clear any previous errors on success
      } catch (err: any) {
        console.error("❌ Error sending LED command:", err);
        console.error("❌ Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        setError(err.message || "Failed to send command to Arduino");
        
        // If error suggests port is closed, clear the port
        if (err.message?.includes("closed") || err.name === "InvalidStateError") {
          setPort(null);
        }
        throw err; // Re-throw so caller knows it failed
      }
    },
    [port, isPortOpen]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (port) {
        port.close().catch(console.error);
      }
    };
  }, [port]);

  return {
    isConnected: port !== null,
    isConnecting,
    error,
    connect,
    disconnect,
    sendLEDCommand,
  };
};


import React, { createContext, useContext } from "react";
import { useArduino } from "@/hooks/useArduino";

const ArduinoContext = createContext<ReturnType<typeof useArduino> | null>(null);

export const ArduinoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const arduino = useArduino();
  return <ArduinoContext.Provider value={arduino}>{children}</ArduinoContext.Provider>;
};

export const useArduinoContext = () => {
  const context = useContext(ArduinoContext);
  if (!context) {
    throw new Error("useArduinoContext must be used within an ArduinoProvider");
  }
  return context;
};

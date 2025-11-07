/// <reference types="vite/client" />

// Web Serial API type definitions
interface SerialPort extends EventTarget {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: "none" | "even" | "odd";
  bufferSize?: number;
  flowControl?: "none" | "hardware";
}

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface Navigator {
  serial: {
    requestPort(): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
    addEventListener(type: "connect" | "disconnect", listener: (event: Event) => void): void;
    removeEventListener(type: "connect" | "disconnect", listener: (event: Event) => void): void;
  };
}

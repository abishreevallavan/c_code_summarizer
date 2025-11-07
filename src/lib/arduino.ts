let writer: WritableStreamDefaultWriter | null = null;

export async function connectArduino() {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
  writer = port.writable!.getWriter();
  console.log("Arduino Connected");
}

export async function sendToArduino(cmd: string) {
  if (!writer) {
    console.warn("Arduino not connected yet");
    return;
  }
  await writer.write(new TextEncoder().encode(cmd + "\n"));
}

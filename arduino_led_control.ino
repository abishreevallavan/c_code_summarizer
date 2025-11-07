// Arduino LED Control for Code Analysis
// Pin 10: Red LED (Errors detected)
// Pin 9: Yellow LED (More than 1 suggestion)
// Pin 11: Green LED (No errors, 1 or 0 suggestions)

#define RED_PIN 10
#define YELLOW_PIN 9
#define GREEN_PIN 11

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Set LED pins as outputs
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  
  // Turn off all LEDs initially
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
  
  // Self-test: blink each LED once quickly
  digitalWrite(RED_PIN, HIGH);
  delay(150);
  digitalWrite(RED_PIN, LOW);
  delay(100);
  
  digitalWrite(YELLOW_PIN, HIGH);
  delay(150);
  digitalWrite(YELLOW_PIN, LOW);
  delay(100);
  
  digitalWrite(GREEN_PIN, HIGH);
  delay(150);
  digitalWrite(GREEN_PIN, LOW);
  
  delay(200);
  Serial.println("Arduino LED Controller Ready");
}

void loop() {
  if (Serial.available() > 0) {
    // Read the command
    String command = "";
    while (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '\n' || c == '\r') {
        break;
      }
      command += c;
    }
    
    command.trim();
    command.toUpperCase();
    
    // Debug: echo received command
    Serial.print("Received: ");
    Serial.println(command);
    
    // Turn off all LEDs first
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, LOW);
    
    // Small delay to ensure clean state
    delay(10);
    
    // Process command and keep LED on until next command
    if (command == "RED") {
      digitalWrite(RED_PIN, HIGH);
      Serial.println("Red LED ON - Errors detected");
    } else if (command == "YELLOW") {
      digitalWrite(YELLOW_PIN, HIGH);
      Serial.println("Yellow LED ON - Multiple suggestions");
    } else if (command == "GREEN") {
      digitalWrite(GREEN_PIN, HIGH);
      Serial.println("Green LED ON - No errors, minimal suggestions");
    } else if (command == "OFF") {
      Serial.println("All LEDs OFF");
    } else if (command.length() > 0) {
      Serial.print("Unknown command: [");
      Serial.print(command);
      Serial.println("]");
    }
  }
}


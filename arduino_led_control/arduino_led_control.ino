#define RED_PIN 10
#define YELLOW_PIN 9
#define GREEN_PIN 11

void setup() {
  Serial.begin(9600);

  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);

  // turn all LEDs off at start
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);

  // quick self-test
  digitalWrite(RED_PIN, HIGH); delay(200); digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, HIGH); delay(200); digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, HIGH); delay(200); digitalWrite(GREEN_PIN, LOW);

  Serial.println("READY");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    cmd.toUpperCase();

    // turn off all
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, LOW);

    if (cmd == "RED") {
      digitalWrite(RED_PIN, HIGH);
    }
    else if (cmd == "YELLOW") {
      digitalWrite(YELLOW_PIN, HIGH);
    }
    else if (cmd == "GREEN") {
      digitalWrite(GREEN_PIN, HIGH);
    }
    else if (cmd == "OFF") {
      // do nothing (already all OFF)
    }
  }
}

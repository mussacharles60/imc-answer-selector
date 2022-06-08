int p1 = 2;
int p2 = 3;
int p3 = 4;
int p4 = 5;
int p5 = 6;

int lastPressed = 0;

void setup() {
    Serial.begin(9600);

    pinMode(p1, INPUT_PULLUP);
    pinMode(p2, INPUT_PULLUP);
    pinMode(p3, INPUT_PULLUP);
    pinMode(p4, INPUT_PULLUP);
    pinMode(p5, INPUT_PULLUP);
}

void loop() {
    if (digitalRead(p1) == 0) {
        if (lastPressed == 0) {
            Serial.println("1");
            lastPressed = 1;
        }
    }
    else if (digitalRead(p2) == 0) {
         if (lastPressed == 0) {
            Serial.println("2");
            lastPressed = 2;
        }
    }
    else if (digitalRead(p3) == 0) {
         if (lastPressed == 0) {
            Serial.println("3");
            lastPressed = 3;
        }
    }
    else if (digitalRead(p4) == 0) {
         if (lastPressed == 0) {
            Serial.println("4");
            lastPressed = 4;
        }
    }
    else if (digitalRead(p5) == 0) {
         if (lastPressed == 0) {
            Serial.println("5");
            lastPressed = 5;
        }
    }
    else {
        lastPressed = 0;
    }
    //
    if (digitalRead(p1) == 1) {
        if (lastPressed == 1) {
            lastPressed = 0;
        }
    }
    if (digitalRead(p2) == 1) {
        if (lastPressed == 2) {
            lastPressed = 0;
        }
    }
    if (digitalRead(p3) == 1) {
        if (lastPressed == 3) {
            lastPressed = 0;
        }
    }
    if (digitalRead(p4) == 1) {
        if (lastPressed == 4) {
            lastPressed = 0;
        }
    }
    if (digitalRead(p5) == 1) {
        if (lastPressed == 5) {
            lastPressed = 0;
        }
    }
}

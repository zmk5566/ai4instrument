/*---------------------------------------------------------------------------------------------

  Open Sound Control (OSC) library for the ESP8266/ESP32

  Example for sending messages from the ESP8266/ESP32 to a remote computer
  The example is sending "hello, osc." to the address "/test".

  This example code is in the public domain.

--------------------------------------------------------------------------------------------- */
#if defined(ESP8266)
#include <ESP8266WiFi.h>
#else
#include <WiFi.h>
#endif
#include <WiFiUdp.h>
#include <OSCMessage.h>

const char* ssid = "fluid-away";  // Enter SSID here
const char* password = "kkkk8888";  //Enter Password here

WiFiUDP Udp;                                // A UDP instance to let us send and receive packets over UDP

IPAddress local_ip(192, 168, 1, 1);
IPAddress outIp(192, 168, 1, 10);

IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);


const unsigned int outPort = 9999;          // remote port to receive OSC
const unsigned int localPort = 8888;        // local port to listen for OSC packets (actually not used for sending)

void setup() {
    Serial.begin(115200);

    // Connect to WiFi network
    Serial.println();
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.softAP(ssid, password);
    WiFi.softAPConfig(local_ip, gateway, subnet);


    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    Serial.println("Starting UDP");
    Udp.begin(localPort);
    Serial.print("Local port: ");
#ifdef ESP32
    Serial.println(localPort);
#else
    Serial.println(Udp.localPort());
#endif

}

void loop() {
    OSCMessage msg("/arduino/sensors");

    sensorValue = analogRead(analogInPin);
  // map it to the range of the analog out:
    outputValue = map(sensorValue, 0, 1023, 0, 255);


    msg.add(analogRead(30));
    msg.add(analogRead(31));
    msg.add(analogRead(32));
    msg.add(analogRead(33));

    Udp.beginPacket(outIp, outPort);
    msg.send(Udp);
    Udp.endPacket();
    msg.empty();
    delay(100);
}
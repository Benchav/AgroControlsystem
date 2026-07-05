#include "DHT.h"

#define DHTPIN 2          // Pin digital conectado al DHT22
#define DHTTYPE DHTTYPE_22   // Sensor DHT 22

DHT dht(DHTPIN, DHTTYPE);

// Configuración alineada con el modelo initialArduinos
const char* ARDUINO_ID = "ARD-UNO-02";
const char* LOCATION = "Sector 2A";
const unsigned long BAUD_RATE = 9600;
const int FREQUENCY_SECONDS = 5; // Frecuencia de envío definida en tu modelo

void setup() {
  Serial.begin(BAUD_RATE);
  dht.begin();
}

void loop() {
  // Esperar el tiempo determinado por la frecuencia configurada (convertido a ms)
  delay(FREQUENCY_SECONDS * 1000);

  // Lectura de temperatura y humedad ambiental
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Validar si la lectura falló
  if (isnan(h) || isnan(t)) {
    Serial.println(F("{\"error\": \"Fallo al leer el sensor DHT22\"}"));
    return;
  }

  // Lógica de negocio para determinar el estado (status y tone) según el modelo de tu interfaz
  String t_status = "OK";
  String t_tone = "emerald";
  
  if (t > 30.0 || t < 14.0) {
    t_status = "Crítico";
    t_tone = "red";
  } else if (t > 26.0 || t < 18.0) {
    t_status = "Atención";
    t_tone = "amber";
  }

  String h_status = "OK";
  String h_tone = "emerald";

  if (h > 85.0 || h < 40.0) {
    h_status = "Crítico";
    h_tone = "red";
  } else if (h > 75.0 || h < 50.0) {
    h_status = "Atención";
    h_tone = "amber";
  }

  // Estructura de salida JSON limpia lista para mapear con tu interfaz de Sensor en React
  Serial.println(F("--- TELEMETRÍA AGRO CONTROL ---"));
  
  // Sensor 1: Temperatura
  Serial.print(F("{\"id\":\"SEN-TEMP-02\",\"name\":\"Temperatura Invernadero\",\"type\":\"Temperatura\",\"value\":\""));
  Serial.print(t, 1);
  Serial.print(F("°C\",\"numericValue\":"));
  Serial.print(t, 2);
  Serial.print(F(",\"unit\":\"°C\",\"location\":\""));
  Serial.print(LOCATION);
  Serial.print(F("\",\"status\":\""));
  Serial.print(t_status);
  Serial.print(F("\",\"tone\":\""));
  Serial.print(t_tone);
  Serial.print(F("\",\"arduinoId\":\""));
  Serial.print(ARDUINO_ID);
  Serial.println(F("\"}"));

  // Sensor 2: Humedad
  Serial.print(F("{\"id\":\"SEN-HUM-02\",\"name\":\"Humedad Invernadero\",\"type\":\"Humedad Ambiental\",\"value\":\""));
  Serial.print(h, 1);
  Serial.print(F("%\",\"numericValue\":"));
  Serial.print(h, 2);
  Serial.print(F(",\"unit\":\"%\",\"location\":\""));
  Serial.print(LOCATION);
  Serial.print(F("\",\"status\":\""));
  Serial.print(h_status);
  Serial.print(F("\",\"tone\":\""));
  Serial.print(h_tone);
  Serial.print(F("\",\"arduinoId\":\""));
  Serial.print(ARDUINO_ID);
  Serial.println(F("\"}"));
  
  Serial.println(F("-------------------------------"));
}
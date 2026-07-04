#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// --- CONFIGURACIÓN ---
#define DHTPIN 15          // Pin donde conectamos el sensor
#define DHTTYPE DHT22      // Tipo de sensor
DHT dht(DHTPIN, DHTTYPE);

// ID ÚNICO DE ESTE ARDUINO (Cambiamos esto si creamos otro archivo para simular un segundo Arduino)
const char* ARDUINO_ID = "ARD-MEGA-01"; 

// Servidor MQTT Gratuito y Público
const char* mqtt_server = "broker.hivemq.com";
const char* mqtt_topic = "agro/proyecto/sensores";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Conectar al Wi-Fi virtual de Wokwi (siempre es Wokwi-GUEST sin contraseña)
  Serial.print("Conectando a Wi-Fi...");
  WiFi.begin("Wokwi-GUEST", "", 6);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n¡Conectado al Wi-Fi de Wokwi!");

  client.setServer(mqtt_server, 1883);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Intentando conexión MQTT...");
    // Intentar conectar con un ID de cliente aleatorio
    String clientId = "ESP32Client-" + String(random(0, 10000));
    if (client.connect(clientId.c_str())) {
      Serial.println("¡Conectado al Broker!");
    } else {
      Serial.print("Falló con estado: ");
      Serial.print(client.state());
      Serial.println(" Reintentando en 5 segundos...");
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Leer datos del sensor virtual
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Validar que la lectura sea correcta
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Error al leer el sensor DHT22");
    delay(2000);
    return;
  }

  // Crear el string en formato JSON idéntico a tus entidades de React
  String jsonPayload = "{";
  jsonPayload += "\"arduinoId\":\"" + String(ARDUINO_ID) + "\",";
  jsonPayload += "\"temperature\":" + String(temperature, 1) + ",";
  jsonPayload += "\"humidity\":" + String(humidity, 0);
  jsonPayload += "}";

  Serial.print("Enviando datos: ");
  Serial.println(jsonPayload);

  // Publicar en internet
  client.publish(mqtt_topic, jsonPayload.c_str());

  // Esperar 3 segundos antes de la siguiente lectura
  delay(3000);
}
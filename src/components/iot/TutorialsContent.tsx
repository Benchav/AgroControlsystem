import React from "react";
import { PageSection } from "../../components/layout/PageSection";

export const TutorialsContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <PageSection
            title="Videotutorial: Configuración e Instalación del Sensor"
            subtitle="Guía práctica y explicativa"
          >
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/4iUKqnasR6s?autoplay=1&mute=1&loop=1&playlist=4iUKqnasR6s&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0"
                title="Configuración de Sensor de Humedad con Arduino"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
              <p className="text-xs text-slate-300">
                <strong>💡 Recomendación Técnica:</strong> Para lecturas
                continuas estables en tierra agrícola comercial, se recomienda
                usar sensores de humedad capacitivos (como el v1.2) en lugar de
                los sensores resistivos estándar, ya que previenen la corrosión
                de los electrodos por electrólisis.
              </p>
            </div>
          </PageSection>
        </div>

        <div className="space-y-4">
          <PageSection
            title="Esquema de Conexión"
            subtitle="Hardware requerido"
          >
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex justify-between items-center border-b border-white/6 py-1.5">
                <span>1. Arduino Board (Uno o Mega)</span>
                <span className="text-xs text-slate-500">1 unidad</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/6 py-1.5">
                <span>2. Sensor FC-28 o Capacitivo</span>
                <span className="text-xs text-slate-500">1 unidad</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/6 py-1.5">
                <span>3. Cables Dupont (Macho-Hembra)</span>
                <span className="text-xs text-slate-500">3 unidades</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/6 py-1.5">
                <span>4. Resistencia 10k Ohm (Resistivo)</span>
                <span className="text-xs text-slate-500">Opcional</span>
              </div>
            </div>
          </PageSection>

          <PageSection
            title="Código Arduino Básico"
            subtitle="Sketch para lectura de humedad"
          >
            <pre className="overflow-x-auto rounded-xl bg-black/40 p-4 font-mono text-[11px] text-emerald-400 border border-white/5 max-h-[220px]">{`const int sensorPin = A0; 
                int sensorValue = 0;

                void setup() {
                Serial.begin(115200); 
                }

                void loop() {
                sensorValue = analogRead(sensorPin);
                
                // Convertir lectura a porcentaje (0-100)
                int porcentaje = map(sensorValue, 1023, 200, 0, 100);
                
                Serial.print("Humedad: ");
                Serial.print(porcentaje);
                Serial.println("%");
                
                delay(2000); // 2 segundos
                }`}
            </pre>
          </PageSection>
        </div>
      </div>
    </div>
  );
};

export default TutorialsContent;

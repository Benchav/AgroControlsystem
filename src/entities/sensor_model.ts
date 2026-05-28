export interface Sensor {
  id: string;
  name: string;
  type: string;
  value: string;
  numericValue: number;
  unit: string;
  location: string;
  status: 'OK' | 'Atención' | 'Crítico';
  tone: 'emerald' | 'amber' | 'red' | 'cyan';
  arduinoId: string;
}

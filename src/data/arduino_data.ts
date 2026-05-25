import { Arduino } from "../entities/arduino_model";

// Semillas de datos iniciales
export const initialArduinos: Arduino[] = [
  {
    id: 'ARD-MEGA-01',
    name: 'Arduino Mega - Principal',
    location: 'Parcela Norte',
    status: 'active',
    baudRate: 115200,
    frequency: 2,
    description: 'Controlador de sensores de suelo de alta precisión en parcela norte.',
  },
  {
    id: 'ARD-UNO-02',
    name: 'Arduino Uno - Invernadero',
    location: 'Sector 2A',
    status: 'active',
    baudRate: 9600,
    frequency: 5,
    description: 'Monitoreo de temperatura y humedad interna en domo invernadero.',
  },
  {
    id: 'ARD-NANO-03',
    name: 'Arduino Nano - Riego',
    location: 'Zona Crítica',
    status: 'inactive',
    baudRate: 9600,
    frequency: 10,
    description: 'Control de electroválvulas y sensor de flujo de agua en sector sur.',
  },
];
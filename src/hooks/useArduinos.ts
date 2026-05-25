import { useState, useEffect } from 'react';
import { Arduino } from '../entities/arduino_model';
import { initialArduinos } from '../data/arduino_data';

export function useArduinos() {
  const [arduinos, setArduinos] = useState<Arduino[]>(() => {
    try {
      const saved = localStorage.getItem('ac_arduinos');
      return saved ? JSON.parse(saved) : initialArduinos;
    } catch (e) {
      return initialArduinos;
    }
  });

  useEffect(() => {
    localStorage.setItem('ac_arduinos', JSON.stringify(arduinos));
  }, [arduinos]);

  const addArduino = (a: Arduino) => setArduinos((p) => [...p, a]);

  const toggleArduinoStatus = (id: string) => {
    setArduinos((prev) => prev.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a)));
  };

  const deleteArduino = (id: string) => setArduinos((prev) => prev.filter((a) => a.id !== id));

  return { arduinos, addArduino, toggleArduinoStatus, deleteArduino, setArduinos };
}

export default useArduinos;

//example : 17:36
export function formatShortTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

//example : 17/10/2023 17:36
export function formatLongTime(timestamp: number) {
  return new Date(timestamp).toLocaleString('es', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
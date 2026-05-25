export interface Alert {
  id: string;
  emoji: string;
  title: string;
  description: string;
  time: string;
  severity: 'red' | 'amber';
  resolved: boolean;
}
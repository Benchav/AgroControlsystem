export interface Arduino {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  baudRate: number;
  frequency: number;
  description: string;
}

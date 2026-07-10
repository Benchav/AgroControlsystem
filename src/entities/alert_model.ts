export type AlertSeverity = 'red' | 'amber' | 'cyan'; 
export type AlertSource = "telemetria" | "subasta";

export interface Alert {
  id: string;
  emoji: string;      
  title: string;
  description: string;
  time: string;        
  severity: AlertSeverity;
  resolved: boolean;   
  source: AlertSource;
  
  // redirección por ID
  targetPage: "parcels" | "market" | "dashboard";
  targetId?: string; 
}
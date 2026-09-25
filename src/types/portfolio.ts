export interface Project {
  id: string;
  number: string;
  title: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
  deliverables: string[];
  metrics: string;
  accentColor: string;
  liveUrl?: string;
}

export interface ServicePhase {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  tools: string[];
}

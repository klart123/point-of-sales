export interface ServerEntry {
  ip: string;
  latencyMs?: number;
  label?: string;
  type?: 'lan' | 'supabase'; // add this
  baseURL?: string; // full URL override for supabase
}

export interface ServerDiscoveryModalProps {
  visible: boolean;
  currentBaseURL: string | null;
  onSelect: (baseURL: string) => void;
  onClose: () => void;
  port?: number;
}

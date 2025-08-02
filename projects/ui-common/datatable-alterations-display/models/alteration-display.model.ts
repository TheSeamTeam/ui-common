export interface AlterationDisplayItem {
  id: string;
  type: string;
  summary: string; // Compact one-line description
  details?: string[]; // Optional expanded details
  sortOrder?: number; // For sorting within type
  diffState?: AlterationVisualState; // Visual state for diff display
}

export interface AlterationDiffState {
  added: AlterationDisplayItem[];
  removed: AlterationDisplayItem[];
  changed: AlterationDisplayItem[];
  unchanged: AlterationDisplayItem[];
}

export type AlterationDiffMode = 'auto' | 'manual'

export type AlterationVisualState = 'added' | 'removed' | 'changed' | 'unchanged'

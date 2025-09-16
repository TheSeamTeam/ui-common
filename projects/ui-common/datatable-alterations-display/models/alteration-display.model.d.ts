export interface AlterationDisplayItem {
    id: string;
    type: string;
    summary: string;
    details?: string[];
    sortOrder?: number;
    diffState?: AlterationVisualState;
}
export interface AlterationDiffState {
    added: AlterationDisplayItem[];
    removed: AlterationDisplayItem[];
    changed: AlterationDisplayItem[];
    unchanged: AlterationDisplayItem[];
}
export type AlterationDiffMode = 'auto' | 'manual';
export type AlterationVisualState = 'added' | 'removed' | 'changed' | 'unchanged';

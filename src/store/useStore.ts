import { create } from 'zustand';

interface AppState {
  progress: number;
  setProgress: (p: number) => void;
  activeScene: string;
  setActiveScene: (s: string) => void;
  hoveredNode: number | null;
  setHoveredNode: (id: number | null) => void;
}

export const useStore = create<AppState>((set) => ({
  progress: 0,
  setProgress: (p) => set({ progress: p }),
  activeScene: 'hero',
  setActiveScene: (s) => set({ activeScene: s }),
  hoveredNode: null,
  setHoveredNode: (id) => set({ hoveredNode: id }),
}));

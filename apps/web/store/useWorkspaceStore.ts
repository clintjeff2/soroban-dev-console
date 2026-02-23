import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Workspace {
  id: string;
  name: string;
  contractIds: string[];
  savedCalls: string[]; // IDs of calls from useSavedCallsStore
  createdAt: number;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string;

  // Actions
  createWorkspace: (name: string) => void;
  setActiveWorkspace: (id: string) => void;
  addContractToWorkspace: (workspaceId: string, contractId: string) => void;
  deleteWorkspace: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaces: [
        {
          id: 'default',
          name: 'Default Project',
          contractIds: [],
          savedCalls: [],
          createdAt: Date.now(),
        },
      ],
      activeWorkspaceId: 'default',

      createWorkspace: (name) =>
        set((state) => ({
          workspaces: [
            ...state.workspaces,
            {
              id: crypto.randomUUID(),
              name,
              contractIds: [],
              savedCalls: [],
              createdAt: Date.now(),
            },
          ],
        })),

      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

      addContractToWorkspace: (workspaceId, contractId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, contractIds: [...new Set([...w.contractIds, contractId])] } : w
          ),
        })),

      deleteWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
          activeWorkspaceId: state.activeWorkspaceId === id ? 'default' : state.activeWorkspaceId,
        })),
    }),
    { name: 'soroban-workspaces' }
  )
);
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Workspace {
  id:   string;
  name: string;
  slug: string;
  plan: string;
}

interface WorkspaceContextValue {
  workspaces:      Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaces:         [],
  activeWorkspace:    null,
  setActiveWorkspace: () => {},
});

interface WorkspaceProviderProps {
  initialWorkspaces: Workspace[];
  children:          ReactNode;
}

export function WorkspaceProvider({ initialWorkspaces, children }: WorkspaceProviderProps) {
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(
    initialWorkspaces[0] ?? null
  );
  const [isMounted, setIsMounted] = useState(false);

  /* ── Hydration fix: load from localStorage only after mount ───── */
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("activeWorkspaceId");
    if (stored) {
      const match = initialWorkspaces.find((ws) => ws.id === stored);
      if (match) setActiveWorkspaceState(match);
    }
  }, [initialWorkspaces]);

  /* Sync with initialWorkspaces if it changes (e.g. workspace created/deleted) */
  useEffect(() => {
    if (!activeWorkspace && initialWorkspaces.length > 0) {
      setActiveWorkspaceState(initialWorkspaces[0]);
    } else if (activeWorkspace) {
      // Ensure current activeWorkspace still exists in initialWorkspaces
      const exists = initialWorkspaces.find(ws => ws.id === activeWorkspace.id);
      if (!exists && initialWorkspaces.length > 0) {
        setActiveWorkspaceState(initialWorkspaces[0]);
      } else if (!exists) {
        setActiveWorkspaceState(null);
      }
    }
  }, [initialWorkspaces, activeWorkspace]);

  const setActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspaceState(ws);
    localStorage.setItem("activeWorkspaceId", ws.id);
  };

  return (
    <WorkspaceContext.Provider
      value={{ workspaces: initialWorkspaces, activeWorkspace, setActiveWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}


export function useWorkspace() {
  return useContext(WorkspaceContext);
}

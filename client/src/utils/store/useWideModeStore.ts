import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Lets logged-in admin users opt in to a wider content layout on larger screens - e.g. so more
// variant columns fit in VariantsTab's comparison table - without touching the sidebar/menu at
// all. Persisted so the preference sticks across page navigations and reloads.
type WideModeStore = {
  wideMode: boolean
}

type WideModeActions = {
  toggleWideMode: () => void
  setWideMode: (wideMode: boolean) => void
}

export const useWideModeStore = create<WideModeStore & WideModeActions>()(
  persist(
    (set) => ({
      wideMode: false,
      toggleWideMode: () => set((state) => ({ wideMode: !state.wideMode })),
      setWideMode: (wideMode) => set({ wideMode }),
    }),
    {
      name: 'wideModeStore', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
    }
  )
)

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LoggedInUser } from '../user-util'
import { useEffect, useState } from 'react'

type AuthStore = {
  loggedInUser: LoggedInUser | undefined
}

type AuthActions = {
  clearLoggedInState: () => void
  setLoggedInUser: (loggedInUser: LoggedInUser) => void
}

const useAuthStore = create<AuthStore & AuthActions>()(
  persist(
    (set) => ({
      loggedInUser: undefined,
      clearLoggedInState: () => {
        set({ loggedInUser: undefined })
      },
      setLoggedInUser: (loggedInUser) => set({ loggedInUser }),
    }),
    {
      name: 'authStore', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)

export const useHydratedAuthStore = ((selector, compare) => {
  const store = useAuthStore(selector, compare)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
    ? store
    : {
      loggedInUser: undefined,
      clearLoggedInState: () => undefined,
      setLoggedInUser: () => undefined,
    }
}) as typeof useAuthStore

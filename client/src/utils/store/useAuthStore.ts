import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LoggedInUser } from '../user-util'

type AuthStore = {
  loggedInUser: LoggedInUser | undefined
}

type AuthActions = {
  clearLoggedInState: () => void
  setLoggedInUser: (loggedInUser: LoggedInUser) => void
}

export const useAuthStore = create<AuthStore & AuthActions>()(
  persist(
    (set) => ({
      loggedInUser: undefined,
      clearLoggedInState: () => {
        console.log('clearLoggedInState')
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

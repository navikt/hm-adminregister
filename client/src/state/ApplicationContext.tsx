import React, { Dispatch, SetStateAction, useContext, useState } from 'react'

export interface AppState {
  example: string
}

interface IApplicationContext {
  appState: AppState
  setAppState: Dispatch<SetStateAction<AppState>>

  resetAppState(): void
}

export const initialAppState: AppState = {
  example: '',
}

const ApplicationContext = React.createContext<IApplicationContext>({
  appState: initialAppState,
  setAppState() {},
  resetAppState() {},
})

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState(initialAppState)
  return (
    <ApplicationContext.Provider
      value={{
        appState,
        setAppState,
        resetAppState() {
          setAppState(initialAppState)
        },
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplicationContext(): IApplicationContext {
  return useContext(ApplicationContext)
}

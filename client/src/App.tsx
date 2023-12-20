import { ErrorBoundary } from 'react-error-boundary'
import { Route, Routes } from 'react-router-dom'
import { isHttpError } from './error'
import { Feilside } from './Feilside'
import { IkkeAutorisert } from './IkkeAutorisert'
import { Forside } from './Forside'
import { Krav } from './krav/Krav'
import { ApplicationProvider } from './state/ApplicationContext'
import { useTranslation } from 'react-i18next'
import Navbar from "./layout/Navbar";


export function App2() {
    return (
        <h2>
            Hei ja
        </h2>
    )
}

export function App() {
    return (
        <FeilGrense erInnsendingFeil={false}>
            <ApplicationProvider>
                <Routes>
                    <Route
                        path="/"
                        element={
                        <>
                            <Navbar />
                            <Forside />
                        </>
                        }
                    />
                    <Route
                        path="/logg-inn"
                        element={
                            <Krav />
                        }
                    />
                </Routes>
            </ApplicationProvider>
        </FeilGrense>
    )
}

const FeilGrense = ({ erInnsendingFeil, children }: { erInnsendingFeil: Boolean; children?: React.ReactNode }) => {
    const { t } = useTranslation()
    return (
        <ErrorBoundary
            fallbackRender={({ error }) => {
                if (isHttpError(error)) {
                    if (error.status === 403) {
                        return <IkkeAutorisert />
                    } else return <Feilside status={error.status} error={error} erInnsendingFeil={erInnsendingFeil} />
                } else {
                    return <Feilside status={500} error={error} erInnsendingFeil={erInnsendingFeil} />
                }
            }}
        >
            {children}
        </ErrorBoundary>
    )
}

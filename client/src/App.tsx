import { Route, Routes } from 'react-router-dom'
import { ApplicationProvider } from './state/ApplicationContext'
import LoggInn from "./logg-inn/LoggInn";
import ErrorModal from "./components/ErrorModal";
import Navbar from "./components/layout/Navbar";
import Produkter from "./produkter/Produkter";

export function App() {
    return (
        <>
            <ErrorModal />
            <ApplicationProvider>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <LoggInn />
                            </>
                        }
                    />
                    <Route
                        path="/produkter"
                        element={
                            <>
                                <Navbar />
                                <Produkter />
                            </>
                        }
                    />
                    <Route
                        path="/logg-inn"
                        element={
                            <LoggInn />
                        }
                    />
                </Routes>
            </ApplicationProvider>
        </>
    )
}


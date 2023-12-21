import { Route, Routes } from 'react-router-dom'
import { ApplicationProvider } from './state/ApplicationContext'
import LoggInn from './logg-inn/LoggInn'
import ErrorModal from './components/ErrorModal'
import Navbar from './components/layout/Navbar'
import Produkter from './produkter/Produkter'
import OpprettProdukt from "./produkter/OpprettProdukt";
import Produkt from "./produkter/Produkt";
import RedigerProduktVariant from "./produkter/RedigerProduktVariant";
import OpprettProduktVariant from "./produkter/OpprettProduktVariant";

export function App() {
    return (
        <>
            <ErrorModal />
            <ApplicationProvider>
                <Routes>
                    <Route path="/" element={<LoggInn />} />

                    <Route path="/produkter" element={<><Navbar /><Produkter /></>} />
                    <Route path="/produkter/opprett" element={<><OpprettProdukt /></>} />
                    <Route path="/produkter/:seriesId" element={<><Navbar /><Produkt /></>} />
                    <Route path="/produkter/:seriesId/rediger-variant/:productId"
                           element={<><RedigerProduktVariant /></>} />
                    <Route path="/produkter/:seriesId/opprett-variant/:productId"
                           element={<><OpprettProduktVariant /></>} />

                    <Route path="/logg-inn" element={<LoggInn />} />
                </Routes>
            </ApplicationProvider>
        </>
    )
}

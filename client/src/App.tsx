import { Route, Routes } from 'react-router-dom'
import LoggInn from './logg-inn/LoggInn'
import ErrorModal from './components/ErrorModal'
import Navbar from './components/layout/Navbar'
import Produkter from './produkter/Produkter'
import OpprettProdukt from "./produkter/OpprettProdukt";
import Produkt from "./produkter/Produkt";
import RedigerProduktVariant from "./produkter/RedigerProduktVariant";
import OpprettProduktVariant from "./produkter/OpprettProduktVariant";
import Adminopplysninger from "./admin/Adminopplysninger";
import OpprettAdminBruker from "./admin/OpprettAdminBruker";
import AdminProfil from "./admin/AdminProfil";
import RedigerAdminBruker from "./admin/RedigerAdminBruker";
import SlettAdminBruker from "./admin/SlettAdminBruker";
import Profil from "./profil/Profil";
import RedigerBrukerprofil from "./profil/RedigerBrukerprofil";

export function App() {
    return (
        <>
            <ErrorModal />
            <Routes>
                <Route path="/" element={<LoggInn />} />

                <Route path="/produkter" element={<><Navbar /><Produkter /></>} />
                <Route path="/produkter/opprett" element={<><OpprettProdukt /></>} />
                <Route path="/produkter/:seriesId" element={<><Navbar /><Produkt /></>} />
                <Route path="/produkter/:seriesId/rediger-variant/:productId"
                       element={<><RedigerProduktVariant /></>} />
                <Route path="/produkter/:seriesId/opprett-variant/:productId"
                       element={<><OpprettProduktVariant /></>} />

                <Route path="/admin/profil" element={<><Navbar /><AdminProfil /></>} />
                <Route path="/admin/rediger-admin" element={<><RedigerAdminBruker /></>} />
                <Route path="/admin/opprett-admin" element={<><OpprettAdminBruker /></>} />
                <Route path="/admin/slett-admin" element={<><SlettAdminBruker /></>} />
                <Route path="/admin/adminopplysninger" element={<><Adminopplysninger /></>} />

                <Route path="/profil" element={<><Navbar /><Profil /></>} />
                <Route path="/profil/rediger-brukerprofil" element={<><RedigerBrukerprofil /></>} />

                <Route path="/logg-inn" element={<LoggInn />} />
            </Routes>
        </>
    )
}

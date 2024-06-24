import { Route, Routes } from "react-router-dom";
import LoggInn from "./logg-inn/LoggInn";
import Produkter from "./produkter/Produkter";
import OpprettProdukt from "./produkter/OpprettProdukt";
import Produkt from "./produkter/Produkt";
import RedigerProduktVariant from "./produkter/variants/RedigerProduktVariant";
import OpprettProduktVariant from "./produkter/variants/OpprettProduktVariant";
import Adminopplysninger from "./admin/Adminopplysninger";
import OpprettAdminBruker from "./admin/OpprettAdminBruker";
import AdminProfil from "./admin/AdminProfil";
import RedigerAdminBruker from "./admin/RedigerAdminBruker";
import SlettAdminBruker from "./admin/SlettAdminBruker";
import Profil from "./profil/Profil";
import RedigerBrukerprofil from "./profil/RedigerBrukerprofil";
import Leverandører from "./leverandor/Leverandører";
import LeverandørProfil from "./leverandor/LeverandørProfil";
import OpprettLeverandør from "./leverandor/OpprettLeverandør";
import OpprettLeverandørBruker from "./leverandor/OpprettLeverandørBruker";
import BekreftLeverandRopplysninger from "./logg-inn/BekreftLeverandøropplysninger";
import Brukeropplysninger from "./logg-inn/Brukeropplysninger";
import Rammeavtaler from "./rammeavtaler/Rammeavtaler";
import Rammeavtale from "./rammeavtaler/rammeavtale/Rammeavtale";
import OpprettRammeavtale from "./rammeavtaler/rammeavtale/OpprettRammeavtale";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "error/ErrorFallback";
import { NotFound } from "error/NotFound";
import { Startside } from "Startside";
import { ImporterOgValiderProdukter } from "produkter/import/ImporterOgValiderProdukter";
import Navbar from "felleskomponenter/layout/Navbar";
import { ImporterOgValiderKatalogfil } from "rammeavtaler/import/ImporterOgValiderKatalogfil";
import { TilGodkjenning } from "godkjenning/TilGodkjenning";
import { LoginWrapper } from "LoginWrapper";
import ErrorModal from "error/ErrorModal";
import News from "news/News";

export function App() {
  return (
    <FeilGrense>
      <ErrorModal />
      <Routes>
        <Route path="/" element={<Startside />} />
        <Route path="/logg-inn" element={<LoggInn />} />

        <Route element={<LoginWrapper />}>
          <Route
            path="/produkter/importer-produkter"
            element={
              <>
                <ImporterOgValiderProdukter />
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
            path="/produkter/opprett"
            element={
              <>
                <OpprettProdukt />
              </>
            }
          />
          <Route
            path="/produkter/:seriesId"
            element={
              <>
                <Navbar />
                <Produkt />
              </>
            }
          />
          <Route
            path="/produkter/:seriesId/rediger-variant/:productId"
            element={
              <>
                <RedigerProduktVariant />
              </>
            }
          />
          <Route
            path="/produkter/:seriesId/opprett-variant/:productId"
            element={
              <>
                <OpprettProduktVariant />
              </>
            }
          />

          <Route
            path="/til-godkjenning"
            element={
              <>
                <Navbar />
                <TilGodkjenning />
              </>
            }
          />

          <Route
            path="/admin/profil"
            element={
              <>
                <Navbar />
                <AdminProfil />
              </>
            }
          />
          <Route
            path="/admin/rediger-admin"
            element={
              <>
                <RedigerAdminBruker />
              </>
            }
          />
          <Route
            path="/admin/opprett-admin"
            element={
              <>
                <OpprettAdminBruker />
              </>
            }
          />
          <Route
            path="/admin/slett-admin"
            element={
              <>
                <SlettAdminBruker />
              </>
            }
          />
          <Route
            path="/admin/adminopplysninger"
            element={
              <>
                <Adminopplysninger />
              </>
            }
          />

          <Route
            path="/profil"
            element={
              <>
                <Navbar />
                <Profil />
              </>
            }
          />
          <Route
            path="/profil/rediger-brukerprofil"
            element={
              <>
                <RedigerBrukerprofil />
              </>
            }
          />

          <Route
            path="/leverandor"
            element={
              <>
                <Navbar />
                <Leverandører />
              </>
            }
          />
          <Route
            path="/leverandor/:id"
            element={
              <>
                <Navbar />
                <LeverandørProfil />
              </>
            }
          />
          <Route
            path="/leverandor/opprett-leverandor"
            element={
              <>
                <OpprettLeverandør />
              </>
            }
          />
          <Route
            path="/leverandor/opprett-bruker"
            element={
              <>
                <OpprettLeverandørBruker />
              </>
            }
          />

          <Route
            path="/rammeavtaler"
            element={
              <>
                <Navbar />
                <Rammeavtaler />
              </>
            }
          />
          <Route
            path="/rammeavtaler/:agreementId"
            element={
              <>
                <Navbar />
                <Rammeavtale />
              </>
            }
          />

          <Route
            path="/rammeavtaler/importer-katalogfil"
            element={
              <>
                <ImporterOgValiderKatalogfil />
              </>
            }
          />

          <Route
            path="/rammeavtaler/opprett"
            element={
              <>
                <OpprettRammeavtale />
              </>
            }
          />

          <Route path="/logg-inn/leverandoropplysninger" element={<BekreftLeverandRopplysninger />} />
          <Route path="/logg-inn/brukeropplysninger" element={<Brukeropplysninger />} />
        </Route>

          <Route
            path="/nyheter"
            element={
              <>
                <Navbar />
                <News />
              </>
            }
          />

          <Route
              path="/nyheter/opprett"
              element={
                  <>

                  </>
              }
          />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </FeilGrense>
  );
}

const FeilGrense = ({ children }: { children?: React.ReactNode }) => {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
};

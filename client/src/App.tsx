import { Route, Routes } from "react-router-dom";
import LoggInn from "./logg-inn/LoggInn";
import Products from "products/Products";
import CreateProduct from "products/CreateProduct";
import Product from "products/Product";
import EditProductVariant from "products/variants/EditProductVariant";
import CreateProductVariant from "products/variants/CreateProductVariant";
import Adminopplysninger from "./admin/Adminopplysninger";
import OpprettAdminBruker from "./admin/OpprettAdminBruker";
import AdminProfil from "./admin/AdminProfil";
import RedigerAdminBruker from "./admin/RedigerAdminBruker";
import SlettAdminBruker from "./admin/SlettAdminBruker";
import Profil from "./profil/Profil";
import RedigerBrukerprofil from "./profil/RedigerBrukerprofil";
import Suppliers from "suppliers/Suppliers";
import SupplierProfile from "suppliers/SupplierProfile";
import CreateSupplier from "suppliers/CreateSupplier";
import CreateSupplierProfile from "suppliers/CreateSupplierProfile";
import BekreftLeverandRopplysninger from "./logg-inn/BekreftLeverandøropplysninger";
import Brukeropplysninger from "./logg-inn/Brukeropplysninger";
import Rammeavtaler from "./rammeavtaler/Rammeavtaler";
import Rammeavtale from "./rammeavtaler/rammeavtale/Rammeavtale";
import OpprettRammeavtale from "./rammeavtaler/rammeavtale/OpprettRammeavtale";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "error/ErrorFallback";
import { NotFound } from "error/NotFound";
import { Startside } from "Startside";
import { ImporterOgValiderProdukter } from "products/import/ImporterOgValiderProdukter";
import Navbar from "felleskomponenter/layout/Navbar";
import { ImporterOgValiderKatalogfil } from "rammeavtaler/import/ImporterOgValiderKatalogfil";
import { TilGodkjenning } from "godkjenning/TilGodkjenning";
import { LoginWrapper } from "LoginWrapper";
import ErrorModal from "error/ErrorModal";
import News from "news/News";
import EditSupplier from "suppliers/EditSupplier";
import CreateAndEditNews from "news/CreateAndEditNews";

export function App() {
  return (
    <FeilGrense>
      <ErrorModal />
      <Routes>
        <Route path="/" element={<Startside />} />
        <Route path="/logg-inn" element={<LoggInn />} />

        <Route element={<LoginWrapper />}>
          <Route
            path="/produkter"
            element={
              <>
                <Navbar />
                <Products />
              </>
            }
          />
          <Route
            path="/produkter/opprett"
            element={
              <>
                <CreateProduct />
              </>
            }
          />
          <Route
            path="/produkter/:seriesId"
            element={
              <>
                <Navbar />
                <Product />
              </>
            }
          />
          <Route
            path="/produkter/:seriesId/rediger-variant/:productId"
            element={
              <>
                <EditProductVariant />
              </>
            }
          />
          <Route
            path="/produkter/:seriesId/opprett-variant/:productId"
            element={
              <>
                <CreateProductVariant />
              </>
            }
          />

          <Route
            path="/produkt/:seriesId/importer-produkter"
            element={
              <>
                <ImporterOgValiderProdukter />
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
                <Suppliers />
              </>
            }
          />
          <Route
            path="/leverandor/:id"
            element={
              <>
                <Navbar />
                <SupplierProfile />
              </>
            }
          />
          <Route
            path="/leverandor/opprett-leverandor"
            element={
              <>
                <CreateSupplier />
              </>
            }
          />
          <Route
            path="/leverandor/endre-leverandor/:supplierId"
            element={
              <>
                <EditSupplier />
              </>
            }
          />
          <Route
            path="/leverandor/opprett-bruker"
            element={
              <>
                <CreateSupplierProfile />
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
              <CreateAndEditNews />
            </>
          }
        />
        <Route
          path="/nyheter/rediger"
          element={
            <>
              <CreateAndEditNews />
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

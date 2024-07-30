import { Route, Routes } from "react-router-dom";
import Login from "users/Login";
import Products from "products/Products";
import CreateProduct from "products/CreateProduct";
import Product from "products/Product";
import EditProductVariant from "products/variants/EditProductVariant";
import CreateProductVariant from "products/variants/CreateProductVariant";
import FirstTimeAdminInfo from "./users/admin/FirstTimeAdminInfo";
import CreateAdminUser from "./users/admin/CreateAdminUser";
import AdminProfile from "./users/admin/AdminProfile";
import SupplierProfile from "users/supplier/SupplierProfile";
import EditSupplierUser from "users/supplier/EditSupplierUser";
import Suppliers from "suppliers/Suppliers";
import Supplier from "suppliers/Supplier";
import CreateSupplier from "suppliers/CreateSupplier";
import CreateSupplierUser from "users/supplier/CreateSupplierUser";
import Agreements from "agreements/Agreements";
import CreateAgreement from "agreements/agreement/CreateAgreement";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "error/ErrorFallback";
import { NotFound } from "error/NotFound";
import { Startside } from "Startside";
import { ImporterOgValiderProdukter } from "products/import/ImporterOgValiderProdukter";
import Navbar from "menu/Navbar";
import { ImporterOgValiderKatalogfil } from "agreements/import/ImporterOgValiderKatalogfil";
import { ForApproval } from "approval/ForApproval";
import { LoginWrapper } from "LoginWrapper";
import ErrorModal from "error/ErrorModal";
import News from "news/News";
import EditSupplier from "suppliers/EditSupplier";
import CreateAndEditNews from "news/CreateAndEditNews";
import DeleteAdminUser from "./users/admin/DeleteAdminUser";
import EditAdminUser from "users/admin/EditAdminUser";
import FirstTimeSupplierUserInfo from "users/supplier/FirstTimeSupplierUserInfo";
import FirstTimeSupplierInfo from "users/supplier/FirstTimeSupplierInfo";
import Agreement from "agreements/agreement/Agreement";
import { getFeatureFlags } from "api/FeatureApi";
import { FlagProvider } from "toggles/context";

export function App() {
  const { flags } = getFeatureFlags();

  return (
    <FlagProvider toggles={flags ?? []}>
      <FeilGrense>
        <ErrorModal />
        <Routes>
          <Route path="/" element={<Startside />} />
          <Route path="/logg-inn" element={<Login />} />

          <Route element={<LoginWrapper />}>
            <Route element={<Navbar />}>
              <Route path="/produkter" element={<Products />} />
              <Route path="/produkter/:seriesId" element={<Product />} />

              <Route path="/til-godkjenning" element={<ForApproval />} />

              <Route path="/admin/profil" element={<AdminProfile />} />
              <Route path="/profil" element={<SupplierProfile />} />

              <Route path="/leverandor" element={<Suppliers />} />
              <Route path="/leverandor/:id" element={<Supplier />} />

              <Route path="/rammeavtaler" element={<Agreements />} />
              <Route path="/rammeavtaler/:agreementId" element={<Agreement />} />

              <Route path="/nyheter" element={<News />} />
            </Route>

            <Route path="/produkter/opprett" element={<CreateProduct />} />
            <Route path="/produkter/:seriesId/rediger-variant/:productId" element={<EditProductVariant />} />
            <Route path="/produkter/:seriesId/opprett-variant/:productId" element={<CreateProductVariant />} />
            <Route path="/produkt/:seriesId/importer-produkter" element={<ImporterOgValiderProdukter />} />

            <Route path="/admin/rediger-admin" element={<EditAdminUser />} />
            <Route path="/admin/opprett-admin" element={<CreateAdminUser />} />
            <Route path="/admin/slett-admin" element={<DeleteAdminUser />} />
            <Route path="/admin/adminopplysninger" element={<FirstTimeAdminInfo />} />

            <Route path="/profil/rediger-brukerprofil" element={<EditSupplierUser />} />

            <Route path="/leverandor/opprett-leverandor" element={<CreateSupplier />} />
            <Route path="/leverandor/endre-leverandor/:supplierId" element={<EditSupplier />} />
            <Route path="/leverandor/opprett-bruker" element={<CreateSupplierUser />} />

            <Route path="/rammeavtaler/importer-katalogfil" element={<ImporterOgValiderKatalogfil />} />
            <Route path="/rammeavtaler/opprett" element={<CreateAgreement />} />

            <Route path="/logg-inn/leverandoropplysninger" element={<FirstTimeSupplierInfo />} />
            <Route path="/logg-inn/brukeropplysninger" element={<FirstTimeSupplierUserInfo />} />

            <Route path="/nyheter/opprett" element={<CreateAndEditNews />} />
            <Route path="/nyheter/rediger" element={<CreateAndEditNews />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </FeilGrense>
    </FlagProvider>
  );
}

const FeilGrense = ({ children }: { children?: React.ReactNode }) => {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
};

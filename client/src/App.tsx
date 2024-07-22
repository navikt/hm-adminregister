import { Route, Routes } from "react-router-dom";
import Login from "login/Login";
import Products from "products/Products";
import CreateProduct from "products/CreateProduct";
import Product from "products/Product";
import EditProductVariant from "products/variants/EditProductVariant";
import CreateProductVariant from "products/variants/CreateProductVariant";
import FirstTimeAdminInfo from "./admin/FirstTimeAdminInfo";
import CreateAdminUser from "./admin/CreateAdminUser";
import AdminProfile from "./admin/AdminProfile";
import Profile from "profile/Profile";
import EditProfile from "profile/EditProfile";
import Suppliers from "suppliers/Suppliers";
import SupplierProfile from "suppliers/SupplierProfile";
import CreateSupplier from "suppliers/CreateSupplier";
import CreateSupplierProfile from "suppliers/CreateSupplierProfile";
import Agreements from "agreements/Agreements";
import CreateAgreement from "agreements/agreement/CreateAgreement";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "error/ErrorFallback";
import { NotFound } from "error/NotFound";
import { Startside } from "Startside";
import { ImporterOgValiderProdukter } from "products/import/ImporterOgValiderProdukter";
import Navbar from "felleskomponenter/layout/Navbar";
import { ImporterOgValiderKatalogfil } from "agreements/import/ImporterOgValiderKatalogfil";
import { ForApproval } from "approval/ForApproval";
import { LoginWrapper } from "LoginWrapper";
import ErrorModal from "error/ErrorModal";
import News from "news/News";
import EditSupplier from "suppliers/EditSupplier";
import CreateAndEditNews from "news/CreateAndEditNews";
import DeleteAdminUser from "./admin/DeleteAdminUser";
import EditAdminUser from "admin/EditAdminUser";
import FirstTimeUserInfo from "login/FirstTimeUserInfo";
import FirstTimeSupplierInfo from "login/FirstTimeSupplierInfo";
import Agreement from "agreements/agreement/Agreement";

export function App() {
  return (
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
            <Route path="/profil" element={<Profile />} />

            <Route path="/leverandor" element={<Suppliers />} />
            <Route path="/leverandor/:id" element={<SupplierProfile />} />

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

          <Route path="/profil/rediger-brukerprofil" element={<EditProfile />} />

          <Route path="/leverandor/opprett-leverandor" element={<CreateSupplier />} />
          <Route path="/leverandor/endre-leverandor/:supplierId" element={<EditSupplier />} />
          <Route path="/leverandor/opprett-bruker" element={<CreateSupplierProfile />} />

          <Route path="/rammeavtaler/importer-katalogfil" element={<ImporterOgValiderKatalogfil />} />
          <Route path="/rammeavtaler/opprett" element={<CreateAgreement />} />

          <Route path="/logg-inn/leverandoropplysninger" element={<FirstTimeSupplierInfo />} />
          <Route path="/logg-inn/brukeropplysninger" element={<FirstTimeUserInfo />} />

          <Route path="/nyheter/opprett" element={<CreateAndEditNews />} />
          <Route path="/nyheter/rediger" element={<CreateAndEditNews />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </FeilGrense>
  );
}

const FeilGrense = ({ children }: { children?: React.ReactNode }) => {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
};

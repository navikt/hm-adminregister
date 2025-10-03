import { Route, Routes, useLocation } from "react-router-dom";

import { LoginWrapper } from "LoginWrapper";
import { Startside } from "Startside";
import Agreements from "agreements/Agreements";
import Agreement from "agreements/agreement/Agreement";
import CreateAgreement from "agreements/agreement/CreateAgreement";
import { ImporterOgValiderKatalogfil } from "agreements/import/ImporterOgValiderKatalogfil";
import { getFeatureFlags } from "api/FeatureApi";
import { ForApproval } from "approval/ForApproval";
import { ErrorFallback } from "error/ErrorFallback";
import ErrorModal from "error/ErrorModal";
import { NotFound } from "error/NotFound";
import Navbar from "menu/Navbar";
import CreateAndEditNews from "news/CreateAndEditNews";
import News from "news/News";
import CreateProduct from "products/CreateProduct";
import Product from "products/Product";
import ProductListWrapper from "products/ProductListWrapper";
import { ImporterOgValiderProdukter } from "products/import/ImporterOgValiderProdukter";
import CreateProductVariant from "products/variants/CreateProductVariant";
import EditProductVariant from "products/variants/EditProductVariant";
import { ErrorBoundary } from "react-error-boundary";
import CreateSupplier from "suppliers/CreateSupplier";
import EditSupplier from "suppliers/EditSupplier";
import Supplier from "suppliers/Supplier";
import SupplierList from "suppliers/SupplierList";
import { FlagProvider } from "toggles/context";
import Login from "users/Login";
import EditAdminUser from "users/admin/EditAdminUser";
import CreateSupplierUser from "users/admin/CreateSupplierUser";
import EditSupplierUser from "users/supplier/EditSupplierUser";
import FirstTimeSupplierInfo from "users/supplier/FirstTimeSupplierInfo";
import FirstTimeSupplierUserInfo from "users/supplier/FirstTimeSupplierUserInfo";
import SupplierProfile from "users/supplier/SupplierProfile";
import AdminProfile from "./users/admin/AdminProfile";
import CreateAdminUser from "./users/admin/CreateAdminUser";
import DeleteAdminUser from "./users/admin/DeleteAdminUser";
import FirstTimeAdminInfo from "./users/admin/FirstTimeAdminInfo";
import CreateSupplierUserForSupplier from "users/supplier/CreateSupplierUserForSupplier";
import { ForgotPassword } from "users/reset-password/ForgotPassword";
import { ResetPassword } from "users/reset-password/ResetPassword";
import { VerifyOtp } from "users/reset-password/VerifyOtp";
import { PasswordResetReceit } from "users/reset-password/PasswordResetReceit";
import { useEffect } from "react";
import { logNavigationEvent } from "utils/amplitude";
import CreateHmsUser from "users/hms-user/CreateHmsUser";
import FirstTimeHmsUserInfo from "users/hms-user/FirstTimeHmsUserInfo";
import HmsUserProfile from "users/hms-user/HmsUserProfile";
import Part from "parts/Part";
import Parts from "parts/Parts";
import CreatePart from "parts/CreatePart";
import EditWorksWith from "products/variants/EditWorksWith";

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    logNavigationEvent("Main", "Main navigation", location.pathname);
  }, [location]);
};

export function App() {
  const toggles = getFeatureFlags();
  usePageTracking();

  return (
    <FlagProvider toggles={toggles ?? []}>
      <FeilGrense>
        <ErrorModal />
        <Routes>
          <Route path="/" element={<Startside />} />
          <Route path="/logg-inn" element={<Login />} />
          <Route path="/logg-inn/glemt-passord" element={<ForgotPassword />} />
          <Route path="/logg-inn/send-kode" element={<VerifyOtp />} />
          <Route path="/logg-inn/nytt-passord" element={<ResetPassword />} />
          <Route path="/logg-inn/kvittering" element={<PasswordResetReceit />} />

          <Route element={<LoginWrapper />}>
            <Route element={<Navbar />}>
              <Route path="/produkter" element={<ProductListWrapper />} />

              <Route path="/produkter/:seriesId" element={<Product />} />

              <Route path="/til-godkjenning" element={<ForApproval />} />

              <Route path="/admin/profil" element={<AdminProfile />} />
              <Route path="/profil" element={<SupplierProfile />} />
              <Route path="/hms-bruker" element={<HmsUserProfile />} />

              <Route path="/leverandor" element={<SupplierList />} />
              <Route path="/leverandor/:id" element={<Supplier />} />

              <Route path="/rammeavtaler" element={<Agreements />} />
              <Route path="/rammeavtaler/:agreementId" element={<Agreement />} />

              <Route path="/nyheter" element={<News />} />

              <Route path="/deler" element={<Parts />} />
              <Route path="/del/:productId" element={<Part />} />
            </Route>

            <Route path="/del/opprett" element={<CreatePart />} />

            <Route path="/produkter/opprett" element={<CreateProduct />} />
            <Route path="/produkter/:seriesId/rediger-variant/:productId" element={<EditProductVariant />} />
            <Route path="/produkter/:seriesId/opprett-variant/:productId" element={<CreateProductVariant />} />
            <Route path="/produkt/:seriesId/importer-produkter" element={<ImporterOgValiderProdukter />} />
            <Route path="/produkter/:seriesId/rediger-passer-med/:productId" element={<EditWorksWith />} />

            <Route path="/admin/rediger-admin" element={<EditAdminUser />} />
            <Route path="/admin/opprett-admin" element={<CreateAdminUser />} />
            <Route path="/admin/slett-admin" element={<DeleteAdminUser />} />
            <Route path="/admin/adminopplysninger" element={<FirstTimeAdminInfo />} />
            <Route path="/admin/opprett-bruker" element={<CreateSupplierUser />} />

            <Route path="/admin/opprett-hms-bruker" element={<CreateHmsUser />} />

            <Route path="/profil/rediger-brukerprofil" element={<EditSupplierUser />} />
            <Route path="/profil/rediger-leverandor" element={<EditSupplier />} />

            <Route path="/leverandor/opprett-leverandor" element={<CreateSupplier />} />
            <Route path="/leverandor/rediger-leverandor/:supplierId" element={<EditSupplier />} />
            <Route path="/leverandor/opprett-bruker" element={<CreateSupplierUserForSupplier />} />

            <Route path="/rammeavtaler/importer-katalogfil" element={<ImporterOgValiderKatalogfil />} />
            <Route path="/rammeavtaler/opprett" element={<CreateAgreement />} />

            <Route path="/logg-inn/leverandoropplysninger" element={<FirstTimeSupplierInfo />} />
            <Route path="/logg-inn/brukeropplysninger" element={<FirstTimeSupplierUserInfo />} />

            <Route path="/logg-inn/hms-brukeropplysninger" element={<FirstTimeHmsUserInfo />} />

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

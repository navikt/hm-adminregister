import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { apiPath } from "mocks/apiPath";
import { server } from "mocks/server";
import Product from "products/Product";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";

const dummyProduct = (id: string, title: string, status: string) => {
  return {
    id: id,
    supplierName: "defaultSupplier",
    title: title,
    text: "defaultText",
    isoCategory: {
      isoCode: "10101010",
      isoTitle: "DefaultIsoTitle",
      isoText: "DefaultIsoText",
      isoTextShort: "DefaultIsoTextShort",
      isoTranslations: {
        titleEn: "",
        textEn: "",
      },
      isoLevel: 4,
      isActive: true,
      showTech: true,
      allowMulti: true,
      created: "2024-07-17T12:41:35.676752966",
      updated: "2024-07-17T12:41:35.676759257",
    },
    status: status,
    seriesData: {
      media: [],
      attributes: {
        keywords: ["defaultKeyword"],
        url: "https://nav.no",
      },
    },
    created: "2024-05-24T09:54:25.595126",
    updated: "2024-05-24T09:54:25.595163",
    expired: "2039-05-24T13:00:52.664454747",
    updatedByUser: "system",
    createdByUser: "system",
    variants: [],
    version: 0,
    isExpired: false,
    isPublished: false,
    inAgreement: false,
  };
};

const logIn = (isAdmin: boolean) => {
  const { result } = renderHook(() => useAuthStore());
  result.current.setLoggedInUser({
    isAdminOrHmsUser: isAdmin,
    isAdmin: isAdmin,
    isHmsUser: false,
    isSupplier: !isAdmin,
    userId: "",
    userName: "",
    exp: "",
    supplierName: "",
    supplierId: "",
  });
};

const approvalButton = "Send til godkjenning";
const changeDescriptionButton = "Endre beskrivelse";
const changeKeywordButton = "Endre nøkkelord";
const changeURLButton = "Endre URL";

const addVariantButton = "Legg til ny variant";
const addImagesButton = "Legg til bilder";
const addDocumentsButton = "Legg til dokumenter";
const addVideoButton = "Legg til videolenke";

describe("Produktside", () => {
  test("Redigerbart produkt", async () => {
    logIn(false);
    const { container } = render(
      <MemoryRouter initialEntries={["/produkter/e7ef234a-fc0c-4538-a8b2-63a361ad3529"]}>
        <Routes>
          <Route path={"/produkter/:seriesId"} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "defaultTitle" })).toBeInTheDocument();
    // about
    expect(await screen.findByText("defaultText")).toBeInTheDocument();
    expect(await screen.findByText("defaultKeyword")).toBeInTheDocument();
    expect(await screen.findByText("https://nav.no")).toBeInTheDocument();
    // sidebar
    expect(await screen.findByText("Under endring")).toBeInTheDocument();
    expect(await screen.findByText("defaultSupplier")).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();

    //Redigeringsknapper vises
    expect(await screen.findByRole("button", { name: approvalButton })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: changeDescriptionButton })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: changeKeywordButton })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: changeURLButton })).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("tab", { name: /Egenskaper/ }));
    expect(await screen.findByRole("button", { name: addVariantButton })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    fireEvent.click(await screen.findByRole("tab", { name: /Bilder/ }));
    expect(await screen.findByRole("button", { name: addImagesButton })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    fireEvent.click(await screen.findByRole("tab", { name: /Dokumenter/ }));
    expect(await screen.findByRole("button", { name: addDocumentsButton })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    fireEvent.click(await screen.findByRole("tab", { name: /Videolenker/ }));
    expect(await screen.findByRole("button", { name: addVideoButton })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("Ikke-redigerbart produkt", async () => {
    logIn(false);

    server.use(
      http.get(apiPath("api/v1/series/*"), (info) => {
        return HttpResponse.json(dummyProduct("test2", "title", "PENDING_APPROVAL"));
      }),
    );

    render(
      <MemoryRouter initialEntries={["/produkter/test2"]}>
        <Routes>
          <Route path={"/produkter/:seriesId"} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("Venter på godkjenning")).toHaveLength(2);

    //Redigeringsknapper vises ikke
    expect(screen.queryByRole("button", { name: approvalButton })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: changeDescriptionButton })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: changeKeywordButton })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: changeURLButton })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole("tab", { name: /Egenskaper/ }));
    expect(screen.queryByRole("button", { name: addVariantButton })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole("tab", { name: /Bilder/ }));
    expect(screen.queryByRole("button", { name: addImagesButton })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole("tab", { name: /Dokumenter/ }));
    expect(screen.queryByRole("button", { name: addDocumentsButton })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole("tab", { name: /Videolenker/ }));
    expect(screen.queryByRole("button", { name: addVideoButton })).not.toBeInTheDocument();
  });
});

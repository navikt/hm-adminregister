import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Product from "products/Product";
import { useAuthStore } from "utils/store/useAuthStore";
import { axe } from "jest-axe";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { apiPath } from "mocks/apiPath";

const dummyProduct = (id: string, title: string, draftStatus: string = "DRAFT", adminStatus: string = "PENDING") => {
  return {
    id: id,
    supplierId: uuidv4(),
    identifier: uuidv4(),
    title: title,
    text: "tekst",
    isoCategory: "18100601",
    draftStatus: draftStatus,
    adminStatus: adminStatus,
    status: "ACTIVE",
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
    createdBy: "REGISTER",
    updatedBy: "REGISTER",
    updatedByUser: "system",
    createdByUser: "system",
    createdByAdmin: false,
    count: 23,
    countDrafts: 1,
    countPublished: 0,
    countPending: 0,
    countDeclined: 0,
    version: 0,
    titleLowercase: title.toLowerCase(),
  };
};

const logIn = (isAdmin: boolean) => {
  const { result } = renderHook(() => useAuthStore());
  result.current.setLoggedInUser({
    isAdmin: isAdmin,
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
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 1, name: "defaultTitle" })).toBeInTheDocument();
    // about
    expect(await screen.findByText("defaultText")).toBeInTheDocument();
    expect(await screen.findByText("defaultKeyword")).toBeInTheDocument();
    expect(await screen.findByText("https://nav.no")).toBeInTheDocument();
    // sidebar
    expect(await screen.findByText("Ikke publisert")).toBeInTheDocument();
    expect(await screen.findByText("DefaultSupplier")).toBeInTheDocument();

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

  test("Kan ikke redigere produkt når til godkjenning", async () => {
    logIn(false);

    server.use(
      http.get(apiPath("vendor/api/v1/series/*"), () => {
        return HttpResponse.json(dummyProduct("test2", "title", "DONE", "PENDING"));
      })
    );

    render(
      <MemoryRouter initialEntries={["/produkter/test2"]}>
        <Routes>
          <Route path={"/produkter/:seriesId"} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Venter på godkjenning")).toBeInTheDocument();

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

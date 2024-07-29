import { render, renderHook, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Product from "products/Product";
import { useAuthStore } from "utils/store/useAuthStore";
import { axe } from "jest-axe";

const dummyProduct = (title: string, draftStatus: string = "DRAFT", adminStatus: string = "PENDING") => {
  return {
    id: uuidv4(),
    supplierId: uuidv4(),
    identifier: uuidv4(),
    title: title,
    text: "",
    isoCategory: "18100601",
    draftStatus: draftStatus,
    adminStatus: adminStatus,
    status: "ACTIVE",
    seriesData: {
      media: [],
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

test("Flere produkter", async () => {
  const { result } = renderHook(() => useAuthStore());
  result.current.setLoggedInUser({
    isAdmin: false,
    userId: "",
    userName: "",
    exp: "",
    supplierName: "",
    supplierId: "",
  });
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
  expect(await screen.findByText("Ikke publisert")).toBeInTheDocument();
  expect(await screen.findByText("DefaultSupplier")).toBeInTheDocument();

  expect(await axe(container)).toHaveNoViolations();
});

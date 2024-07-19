import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Products from "products/Products";
import { MemoryRouter } from "react-router-dom";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { v4 as uuidv4 } from "uuid";
import { axe } from "vitest-axe";

vi.mock("environments", () => ({
  HM_REGISTER_URL: vi.fn(() => "http://localhost:8080"),
  VITE_HM_REGISTER_URL: vi.fn(() => "http://localhost:8082/imageproxy"),
}));

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
  server.use(
    http.get(`http://localhost:8080/admreg/vendor/api/v1/series`, () => {
      return HttpResponse.json({
        content: [
          dummyProduct("p1", "DRAFT", "PENDING"), //Utkast
          dummyProduct("p2", "DONE", "PENDING"), //Venter på godkjenning
          dummyProduct("p3", "DRAFT", "REJECTED"), //Avslått
          dummyProduct("p4", "DONE", "APPROVED"), //Publisert
        ],
        pageable: {
          number: 0,
          sort: {
            orderBy: [
              {
                property: "created",
                direction: "DESC",
                ignoreCase: false,
                ascending: false,
              },
            ],
          },
          size: 10,
        },
        totalSize: 3,
        totalPages: 1,
        empty: false,
        size: 10,
        offset: 0,
        pageNumber: 0,
        numberOfElements: 3,
      });
    }),
  );

  const { container } = render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>,
  );

  expect(await screen.findByRole("row", { name: /p1/ })).toHaveTextContent(/23/); //antall varianter

  expect(await screen.findAllByRole("row")).toHaveLength(5); //header + 4 produkter
  expect(await screen.findByRole("row", { name: /Ikke publisert/ }));
  expect(await screen.findByRole("row", { name: /Avslått/ }));
  expect(await screen.findByRole("row", { name: /Venter på godkjenning/ }));
  expect(await screen.findByRole("row", { name: /Publisert/ }));

  expect(await axe(container)).toHaveNoViolations();
});

import { render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import { expect, test, vi } from "vitest";
import Produkter from "produkter/Produkter";
import { MemoryRouter } from "react-router-dom";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { v4 as uuidv4 } from "uuid";
import { axe } from "vitest-axe";

vi.mock("environments", () => ({
  HM_REGISTER_URL: vi.fn(() => "http://localhost:8080"),
  VITE_HM_REGISTER_URL: vi.fn(() => "http://localhost:8082/imageproxy"),
}));

const dummyProduct = (
  title: string,
  draftStatus: string = "DRAFT",
  adminStatus: string = "PENDING",
  status: string = "ACTIVE",
) => {
  return {
    id: uuidv4(),
    supplierId: uuidv4(),
    identifier: uuidv4(),
    title: title,
    text: "",
    isoCategory: "18100601",
    draftStatus: draftStatus,
    adminStatus: adminStatus,
    status: status,
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
    count: 1,
    countDrafts: 1,
    countPublished: 0,
    countPending: 0,
    countDeclined: 0,
    version: 0,
    titleLowercase: title.toLowerCase(),
  };
};

test("List ut produkter", async () => {
  server.use(
    http.get(`http://localhost:8080/admreg/vendor/api/v1/series`, () => {
      return HttpResponse.json({
        content: [
          dummyProduct("p1", "DRAFT", "PENDING", "ACTIVE"), //Utkast
          dummyProduct("p2", "DONE", "PENDING", "ACTIVE"), //Venter på godkjenning
          dummyProduct("p3", "DRAFT", "REJECTED", "ACTIVE"), //Avslått
          dummyProduct("p4", "DONE", "APPROVED", "ACTIVE"), //Publisert
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
      <SWRConfig value={{ provider: () => new Map() }}>
        <Produkter />
      </SWRConfig>
    </MemoryRouter>,
  );

  expect(await screen.findAllByRole("table")).toHaveLength(1);
  expect(await screen.findAllByRole("row")).toHaveLength(5); //header + 4 produkter
  expect(await screen.findByRole("row", {name: /Utkast/}))

  //expect(await axe(container)).toHaveNoViolations();
});

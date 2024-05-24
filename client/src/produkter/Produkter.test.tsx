import { render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import { expect, test, vi } from "vitest";
import Produkter from "produkter/Produkter";
import { MemoryRouter } from "react-router-dom";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { axe } from "vitest-axe";

vi.mock("environments", () => ({
  HM_REGISTER_URL: vi.fn(() => "http://localhost:8080"),
  VITE_HM_REGISTER_URL: vi.fn(() => "http://localhost:8082/imageproxy"),
}));

test("List ut produkter", async () => {
  server.use(
    http.get(`http://localhost:8080/admreg/vendor/api/v1/series`, () => {
      return HttpResponse.json({
        "content" : [ {
          "id" : "67e37dd0-4dc4-415c-8b46-aa499850bcdd",
          "supplierId" : "f639825c-2fc6-49cd-82ae-31b8ffa449a6",
          "identifier" : "67e37dd0-4dc4-415c-8b46-aa499850bcdd",
          "title" : "p1",
          "text" : "",
          "isoCategory" : "18100601",
          "draftStatus" : "DRAFT",
          "adminStatus" : "PENDING",
          "status" : "ACTIVE",
          "seriesData" : {
            "media" : [ ]
          },
          "created" : "2024-05-24T09:54:25.595126",
          "updated" : "2024-05-24T09:54:25.595163",
          "expired" : "2039-05-24T13:00:52.664454747",
          "createdBy" : "REGISTER",
          "updatedBy" : "REGISTER",
          "updatedByUser" : "system",
          "createdByUser" : "system",
          "createdByAdmin" : false,
          "count" : 1,
          "countDrafts" : 1,
          "countPublished" : 0,
          "countPending" : 0,
          "countDeclined" : 0,
          "version" : 0,
          "titleLowercase" : "p1"
        }, {
          "id" : "4e3ba348-3d98-48af-a7ec-7057ba4606a6",
          "supplierId" : "f639825c-2fc6-49cd-82ae-31b8ffa449a6",
          "identifier" : "fad9e499-310d-4720-855e-5822fdb79d72",
          "title" : "p2",
          "text" : "",
          "isoCategory" : "04480303",
          "draftStatus" : "DRAFT",
          "adminStatus" : "PENDING",
          "status" : "ACTIVE",
          "seriesData" : {
            "media" : [ ]
          },
          "created" : "2024-04-15T09:13:37.318931",
          "updated" : "2024-04-15T09:13:37.318937",
          "expired" : "2039-05-24T13:00:52.664902331",
          "createdBy" : "REGISTER",
          "updatedBy" : "REGISTER",
          "updatedByUser" : "system",
          "createdByUser" : "system",
          "createdByAdmin" : false,
          "count" : 1,
          "countDrafts" : 1,
          "countPublished" : 0,
          "countPending" : 0,
          "countDeclined" : 0,
          "version" : 0,
          "titleLowercase" : "p2"
        }, {
          "id" : "4e3ba348-3d98-48af-a7ec-7057ba4606a6",
          "supplierId" : "f639825c-2fc6-49cd-82ae-31b8ffa449a6",
          "identifier" : "fad9e499-310d-4720-855e-5822fdb79d72",
          "title" : "p3",
          "text" : "",
          "isoCategory" : "04480303",
          "draftStatus" : "DRAFT",
          "adminStatus" : "PENDING",
          "status" : "ACTIVE",
          "seriesData" : {
            "media" : [ ]
          },
          "created" : "2024-04-15T09:13:37.318931",
          "updated" : "2024-04-15T09:13:37.318937",
          "expired" : "2039-05-24T13:00:52.664902331",
          "createdBy" : "REGISTER",
          "updatedBy" : "REGISTER",
          "updatedByUser" : "system",
          "createdByUser" : "system",
          "createdByAdmin" : false,
          "count" : 1,
          "countDrafts" : 1,
          "countPublished" : 0,
          "countPending" : 0,
          "countDeclined" : 0,
          "version" : 0,
          "titleLowercase" : "p3"
        }],
        "pageable" : {
          "number" : 0,
          "sort" : {
            "orderBy" : [ {
              "property" : "created",
              "direction" : "DESC",
              "ignoreCase" : false,
              "ascending" : false
            } ]
          },
          "size" : 10
        },
        "totalSize" : 6,
        "totalPages" : 1,
        "empty" : false,
        "size" : 10,
        "offset" : 0,
        "pageNumber" : 0,
        "numberOfElements" : 6
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
  expect(await screen.findAllByRole("row")).toHaveLength(4); //header + 3 produkter
  //expect(await axe(container)).toHaveNoViolations();
});

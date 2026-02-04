import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { server } from "mocks/server";
import { MemoryRouter } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { expect, test } from "vitest";
import ProductListWrapper from "./ProductListWrapper";
import { http, HttpResponse } from "msw";

const dummyProduct = (title: string, editStatus: string = "EDITABLE") => {
  return {
    id: uuidv4(),
    title: title,
    status: editStatus,
    isExpired: false,
    isPublished: false,
    variantCount: 23,
    updated: "2024-05-24T09:54:25.595163",
    updatedByUser: "system",
  };
};

test("Flere produkter", async () => {
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series`, (info) => {
      return HttpResponse.json({
        content: [
          dummyProduct("p1", "EDITABLE"),
          dummyProduct("p2", "PENDING_APPROVAL"),
          dummyProduct("p3", "REJECTED"),
          dummyProduct("p4", "DONE"),
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
    })
  );

  const { container } = render(
    <MemoryRouter>
      <ProductListWrapper />
    </MemoryRouter>
  );

  expect(await screen.findAllByRole("listitem")).toHaveLength(6);

  expect(await screen.findByRole("link", { name: /p1/ })).toHaveTextContent(/23/); //antall varianter
  expect(await screen.findByRole("link", { name: /Under endring/ }));
  expect(await screen.findByRole("link", { name: /Avslått/ }));
  expect(await screen.findByRole("link", { name: /Venter på godkjenning/ }));
  expect(await screen.findByRole("link", { name: /Publisert/ }));

  expect(await axe(container)).toHaveNoViolations();
});

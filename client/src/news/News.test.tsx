import { findAllByRole, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import News from "news/News";
import { MemoryRouter } from "react-router-dom";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { v4 as uuidv4 } from "uuid";
import { axe } from "vitest-axe";

vi.mock("environments", () => ({
  HM_REGISTER_URL: vi.fn(() => "http://localhost:8080"),
  VITE_HM_REGISTER_URL: vi.fn(() => "http://localhost:8082/imageproxy"),
}));

const dummyNews = (title: string, text: string, published: string, expired: string) => {
  return {
    id: uuidv4(),
    title: title,
    text: text,
    status: "ACTIVE",
    draftStatus: "DRAFT",
    published: published,
    expired: expired,
    created: "2024-07-10T07:03:24.746Z",
    updated: "2024-07-10T07:03:24.746Z",
    author: "string",
    createdBy: "Someone",
    updatedBy: "Someone",
    createdByUser: "Someone",
    updatedByUser: "Someone",
  };
};

test("Flere nyheter", async () => {
  server.use(
    http.get("http://localhost:8080/admreg/admin/api/v1/news", () => {
      return HttpResponse.json({
        content: [
          dummyNews("Nyhet 1", "text1", "2023-07-10T07:03:24.717Z", "2025-07-10T07:03:24.717Z"), //PUBLISHED
          dummyNews("Nyhet 2", "text2", "2023-07-10T07:03:24.717Z", "2023-07-11T07:03:24.717Z"), //UNPUBLISHED
          dummyNews("Nyhet 3", "text3", "2025-07-10T07:03:24.717Z", "2025-07-10T07:03:24.717Z"), //FUTURE
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
      <News />
    </MemoryRouter>,
  );

  expect(await screen.findByRole("heading")).toBeInTheDocument();
  //expect(await screen.findByRole("heading", { name: /Nyhet 2/ })).toBeInTheDocument();
});

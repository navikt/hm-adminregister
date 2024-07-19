import { fireEvent, render, screen } from "@testing-library/react";
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

const dummyNews = (title: string, text: string, published: string, expired: string, status: string) => {
  return {
    id: uuidv4(),
    title: title,
    text: text,
    status: status,
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
          dummyNews("Nyhet 1", "tekst1", "2023-07-10T07:03:24.717Z", "2025-07-10T07:03:24.717Z", "ACTIVE"), //PUBLISHED
          dummyNews("Nyhet 2", "tekst2", "2023-07-10T07:03:24.717Z", "2023-07-11T07:03:24.717Z", "INACTIVE"), //UNPUBLISHED
          dummyNews("Nyhet 3", "tekst3", "2025-07-10T07:03:24.717Z", "2025-07-10T07:03:24.717Z", "INACTIVE"), //FUTURE
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
        totalSize: 1,
        totalPages: 1,
        empty: false,
        size: 10,
        offset: 0,
        pageNumber: 1,
        numberOfElements: 4,
      });
    }),
  );

  const { container } = render(
    <MemoryRouter>
      <News />
    </MemoryRouter>,
  );

  expect(await screen.findByRole("heading")).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: /Nyhet 1/ })).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: /Nyhet 3/ })).toBeInTheDocument();
  expect(screen.queryByText(/Nyhet 2/)).toBeNull();
  expect(await screen.findAllByRole("heading", { name: /Nyhet \d/ })).length(2);

  expect(screen.queryAllByText(/Fremtidig/)).length(2);

  const nyhet3Heading = await screen.findByRole("heading", { name: /Nyhet 3/ });
  fireEvent.click(nyhet3Heading);
  expect(screen.queryByText("tekst3")).exist;

  const historikkButton = await screen.findByText(/Historikk/);
  fireEvent.click(historikkButton);
  expect(screen.queryByText("Avpublisert")).exist;

  expect(await axe(container)).toHaveNoViolations();
});

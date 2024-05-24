import { http, HttpResponse } from "msw";

export const noProductsHandler = http.get(`http://localhost:8080/admreg/vendor/api/v1/series`, () => {
  return HttpResponse.json({
    content: [],
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
    empty: true,
    size: 10,
    offset: 0,
    pageNumber: 0,
    numberOfElements: 1,
  });
});

export const noContentHandlers = [noProductsHandler]

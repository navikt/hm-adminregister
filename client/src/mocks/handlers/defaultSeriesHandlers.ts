import { http, HttpResponse } from "msw";
import { v4 as uuidv4 } from "uuid";
import { apiPath } from "mocks/apiPath";

export const noSeriesHandler = http.get(apiPath("vendor/api/v1/series"), () => {
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

export const defaultSeriesHandler = http.get(apiPath("vendor/api/v1/series/*"), () => {
  return HttpResponse.json({
    id: uuidv4(),
    supplierId: uuidv4(),
    identifier: uuidv4(),
    title: "defaultTitle",
    text: "defaultText",
    isoCategory: "18100601",
    draftStatus: "DRAFT",
    adminStatus: "PENDING",
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
    titleLowercase: "",
  });
});

export const noVariantsHandler = http.get(apiPath("vendor/api/v1/product/registrations/series/*"), () => {
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

export const defaultSeriesHandlers = [noSeriesHandler, noVariantsHandler, defaultSeriesHandler];

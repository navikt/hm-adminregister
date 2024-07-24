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
      attributes: {},
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
  return HttpResponse.json([]);
});

export const defaultInAgreementHandler = http.get(apiPath("vendor/api/v1/product-agreement/in-agreement/*"), () => {
  return HttpResponse.json(false);
});

export const defaultSupplierHandler = http.get(apiPath("vendor/api/v1/supplier/registrations"), () => {
  return HttpResponse.json({
    id: "70d8c7d1-a288-4ba8-ab7c-f77a634b7e20",
    status: "ACTIVE",
    name: "DefaultSupplier",
    supplierData: {
      address: "Vei 1",
      postNr: "0001",
      postLocation: "Oslo",
      countryCode: "No",
      email: "",
      phone: "12345678",
      homepage: "https://finnhjelpemidler.no",
    },
    identifier: "5611edba-8466-484c-bad3-280b1daa60d1",
    created: "2023-08-08T09:03:28.902667",
    updated: "2024-07-19T13:25:30.352713",
    createdBy: "REGISTER",
    updatedBy: "REGISTER",
    updatedByUser: "",
    createdByUser: "",
  });
});

export const defaultIsoHandler = http.get(apiPath("api/v1/isocategories/*"), () => {
  return HttpResponse.json({
    isoCode: "10101010",
    isoTitle: "DefaultIsoTitle",
    isoText: "DefaultIsoText",
    isoTextShort: "DefaultIsoTextShort",
    isoTranslations: {
      titleEn: "",
      textEn: "",
    },
    isoLevel: 4,
    isActive: true,
    showTech: true,
    allowMulti: true,
    created: "2024-07-17T12:41:35.676752966",
    updated: "2024-07-17T12:41:35.676759257",
  });
});

export const defaultSeriesHandlers = [
  noSeriesHandler,
  noVariantsHandler,
  defaultSeriesHandler,
  defaultIsoHandler,
  defaultSupplierHandler,
  defaultInAgreementHandler,
];

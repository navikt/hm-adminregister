import { rest } from "msw";
import { ProdukterTilGodkjenningChunk } from "utils/types/response-types";
import { tilGodkjenningLangListe } from "mocks/data/tilGodkjenningLangListe";
import { apiPath } from "mocks/apiPath";

export const tilGodkjenningHandlers = [
  rest.get<any, any, ProdukterTilGodkjenningChunk>(
    apiPath(`admin/api/v1/product/til-godkjenning`),
    async (req, res, ctx) => {
      const url = new URL(req.url);
      const page = url.searchParams.has("page") ? Number(url.searchParams.get("page")) : null;
      const size = url.searchParams.has("size") ? Number(url.searchParams.get("size")) : null;

      if (page !== null && size !== null) {
        const products = tilGodkjenningLangListe.content.slice(page * size, page * size + size);
        return res(
          ctx.json({
            ...tilGodkjenningLangListe,
            content: products,
            pageNumber: page,
            size: products.length,
            totalPages: Math.ceil(tilGodkjenningLangListe.content.length / size),
            pageable: {
              number: page,
              sort: "title",
              size: products.length,
            },
          }),
        );
      } else {
        return res(ctx.json(tilGodkjenningLangListe));
      }
    },
  ),
];

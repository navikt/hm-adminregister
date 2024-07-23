import { Product } from "utils/types/types";

export const ProductSeriesInfo = ({ product }: { product: Product }) => {
  return (
    <div className="product-series-info">
      <p>
        ISO-kategori: <b>{product.isoCategory}</b>
      </p>
      <p>
        Antall varianter: <b>{product.variantCount}</b>
      </p>
    </div>
  );
};

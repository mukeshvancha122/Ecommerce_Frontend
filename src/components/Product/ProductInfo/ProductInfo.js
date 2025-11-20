import React, { useMemo } from "react";
import "./ProductInfo.css";
import RatingStars from "../RatingStars";
import PriceTag from "../PriceTag";

export default function ProductInfo({ product }) {
  const variation = product?.product_variations?.[0] || {};
  const brand = product?.brand?.brand_name;
  const rating = parseFloat(product?.get_rating_info || "0");

  const specs = useMemo(
    () =>
      [
        { label: "Brand", value: brand },
        {
          label: "Category",
          value: product?.product_category?.category_name,
        },
        {
          label: "Sub Category",
          value: product?.sub_category?.sub_category_name,
        },
        { label: "Color", value: variation?.product_color },
        { label: "Size / Variant", value: variation?.product_size },
        { label: "Stock", value: variation?.stock },
      ].filter((entry) => entry.value),
    [brand, product, variation]
  );

  const highlights = useMemo(() => {
    const lines = [];
    if (product?.product_description) {
      lines.push(product.product_description);
    }
    if (product?.handpicked) {
      lines.push("Handpicked recommendation from our expert curators.");
    }
    if (product?.best_seller) {
      lines.push("Top rated in its category with consistent best-seller status.");
    }
    if (variation?.get_discounted_price && product?.free_delivery) {
      lines.push("Eligible for FREE delivery on qualified orders.");
    }
    return lines;
  }, [product, variation]);

  return (
    <section className="pinfo card" aria-labelledby="p-title">
      <h1 id="p-title" className="pinfo__title">
        {product?.product_name}
      </h1>

      <div className="pinfo__meta">
        {brand && (
          <span>
            Brand: <a href="/">{brand}</a>
          </span>
        )}
        <span className="pinfo__reviews">
          <RatingStars value={rating} />
          <a href="/"> {product?.reviews_count || "100+"} ratings</a>
        </span>
      </div>

      <div className="hr" />

      <div className="pinfo__dealrow">
        {product?.handpicked && <span className="badge">Our pick</span>}
        {product?.best_seller && <span className="badge">Best seller</span>}
        {product?.free_delivery && <span className="badge">Free Delivery</span>}
      </div>

      <PriceTag
        list={Number(variation?.product_price)}
        sale={Number(variation?.get_discounted_price || variation?.product_price)}
        currency="INR"
      />

      {highlights.length > 0 && (
        <ul className="pinfo__highlights">
          {highlights.map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </ul>
      )}

      <dl className="pinfo__specs">
        {specs.map((entry) => (
          <div key={entry.label}>
            <dt>{entry.label}</dt>
            <dd>{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

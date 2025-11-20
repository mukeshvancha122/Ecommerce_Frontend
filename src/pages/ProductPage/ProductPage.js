import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductPage.css";
import { getProductBySlug, getProductById } from "../../api/products/ProductService";

import PDPBreadcrumbs from "../../components/Product/PDPBreadcrumbs/PDPBreadcrumbs";
import ProductGallery from "../../components/Product/ProductGallery/ProductGallery";
import ProductInfo from "../../components/Product/ProductInfo/ProductInfo";
import BuyBox from "../../components/Product/BuyBox/BuyBox";
import FeatureList from "../../components/Product/FeatureList/FeatureList";
import SellerPanel from "../../components/Product/SellerPanel/SellerPanel";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const isNumericId = /^[0-9]+$/.test(String(slug));
        const data = isNumericId ? await getProductById(Number(slug)) : await getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container error">{error}</div>;
  if (!product) return null;

  return (
    <div className="container">
      <PDPBreadcrumbs
        items={[
          { label: "Home & Kitchen", href: "/" },
          { label: "Seasonal Décor", href: "/" },
          { label: "Trees", href: "/" },
        ]}
      />
      <div className="pdp-grid">
        <ProductGallery hero={product.gallery.hero} images={product.gallery.images} alt={product.title} />
        <ProductInfo product={product} />
        <BuyBox product={product} />
      </div>
      <section className="pdp-section">
        <FeatureList title="About this item" bullets={product.about} />
      </section>
      <section className="pdp-section">
        <SellerPanel currency={product.currency} alternatives={product.otherSellers} />
      </section>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductPage.css";
import {
  getProductBySlug,
  getProductById,
  getRelatedProducts,
  getFrequentlyViewedProducts,
} from "../../api/products/ProductService";

import PDPBreadcrumbs from "../../components/Product/PDPBreadcrumbs/PDPBreadcrumbs";
import ProductGallery from "../../components/Product/ProductGallery/ProductGallery";
import ProductInfo from "../../components/Product/ProductInfo/ProductInfo";
import BuyBox from "../../components/Product/BuyBox/BuyBox";
import FeatureList from "../../components/Product/FeatureList/FeatureList";
import RatingStars from "../../components/Product/RatingStars";
import { formatCurrency } from "../../utils/format";

const SpecsTable = ({ title, rows }) => {
  if (!rows.length) return null;
  return (
    <div className="card specsCard">
      <h3>{title}</h3>
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th>{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductCarousel = ({ title, products }) => {
  const trackRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const syncButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 0);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    syncButtons();
  }, [products]);

  const scroll = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="pdp-carousel card">
      <header className="pdp-carousel__header">
        <h3>{title}</h3>
        <div className="pdp-carousel__controls">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            disabled={!canScrollPrev}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            disabled={!canScrollNext}
          >
            ›
          </button>
        </div>
      </header>
      <div
        className="pdp-carousel__track"
        ref={trackRef}
        onScroll={syncButtons}
      >
        {products.map((item) => {
          const variation = item?.product_variations?.[0] || {};
          const priceValue = Number(
            variation?.get_discounted_price || variation?.product_price || 0
          );
          const image = variation?.product_images?.[0]?.product_image;
          const rating = parseFloat(item?.get_rating_info || "0");
          return (
            <a key={item.slug} className="pdp-carousel__card" href={`/product/${item.slug}`}>
              <div className="pdp-carousel__image">
                <img src={image} alt={item.product_name} loading="lazy" />
              </div>
              <div className="pdp-carousel__name">{item.product_name}</div>
              <div className="pdp-carousel__rating">
                <RatingStars value={rating} />
                <span>{item?.reviews_count || "100+"}</span>
              </div>
              <div className="pdp-carousel__price">
                {priceValue ? formatCurrency(priceValue, "INR", "en-IN") : "—"}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [frequentlyViewed, setFrequentlyViewed] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const isNumericId = /^[0-9]+$/.test(String(slug));
        const data = isNumericId
          ? await getProductById(Number(slug))
          : await getProductBySlug(slug);
        if (!data) {
          setError("Product not found");
        } else {
          setProduct(data);
          setError("");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    (async () => {
      try {
        const similar = await getRelatedProducts({
          categorySlug: product.product_category?.slug,
          excludeSlug: product.slug,
          minRating: 4,
        });
        setRelatedProducts(similar || []);
        const frequent = await getFrequentlyViewedProducts(12);
        setFrequentlyViewed(frequent || []);
      } catch (err) {
        console.error("Related products error:", err);
      }
    })();
  }, [product]);

  const variation = product?.product_variations?.[0] || {};

  const galleryImages = useMemo(() => {
    const imgs = variation?.product_images?.map((img) => img.product_image) || [];
    return imgs.length ? imgs : ["/images/NO_IMG.png"];
  }, [variation]);

  const aboutBullets = useMemo(() => {
    const bullets = [];
    if (product?.product_description) bullets.push(product.product_description);
    if (product?.business_product?.business_discount) {
      bullets.push(
        `Business buyers save ${product.business_product.business_discount}% on bulk orders.`
      );
    }
    if (variation?.product_size) bullets.push(`Variant: ${variation.product_size}`);
    if (variation?.product_color) bullets.push(`Color: ${variation.product_color}`);
    return bullets;
  }, [product, variation]);

  const technicalDetails = useMemo(() => {
    const laptop = variation?.laptop_product || {};
    return [
      { label: "Brand", value: product?.brand?.brand_name },
      { label: "Category", value: product?.product_category?.category_name },
      { label: "Sub Category", value: product?.sub_category?.sub_category_name },
      { label: "Processor", value: laptop.laptop_processor },
      { label: "RAM", value: laptop.ram },
      { label: "SSD", value: laptop.ssd },
      { label: "Screen Size", value: laptop.screen_size },
      { label: "Battery", value: laptop.battery_life },
      { label: "Operating System", value: laptop.operating_system },
      { label: "Weight", value: laptop.weight },
    ].filter((row) => row.value);
  }, [product, variation]);

  const productDetails = useMemo(
    () =>
      [
        { label: "Free Delivery", value: product?.free_delivery ? "Available" : "Not available" },
        { label: "Cashback", value: product?.has_cashback ? "Eligible" : "Not eligible" },
        { label: "Exciting Deals", value: product?.exciting_deals },
        {
          label: "Bulk Minimum",
          value: product?.business_product?.minimum_bulk_quantity,
        },
      ].filter((row) => row.value),
    [product]
  );

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container error">{error}</div>;
  if (!product) return null;

  return (
    <div className="container productPageContainer">
      <PDPBreadcrumbs
        items={[
          { label: "All Products", href: "/" },
          { label: product?.product_category?.category_name || "Category", href: "/" },
          { label: product?.sub_category?.sub_category_name || "Sub Category", href: "/" },
        ]}
      />

      <div className="pdp-grid">
        <ProductGallery images={galleryImages} alt={product?.product_name} />
        <ProductInfo product={product} />
        <BuyBox product={product} />
      </div>

      <ProductCarousel title="4 stars and above • Similar items" products={relatedProducts} />

      <section className="pdp-detailsGrid">
        <FeatureList title="About this item" bullets={aboutBullets} />
        <SpecsTable title="Technical Details" rows={technicalDetails} />
        <SpecsTable title="Product Details" rows={productDetails} />
      </section>

      <ProductCarousel
        title="Customers frequently viewed"
        products={frequentlyViewed.filter((item) => item.slug !== product.slug)}
      />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getProductsByCategory, getProductsBySubcategory } from "../../api/products/CategoryProductsService";
import "./ProductsPage.css";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function ProductsPage() {
  const q = useQuery();
  const category = q.get("category");
  const subcategory = q.get("subcategory");
  const label = q.get("label");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        let data;
        if (subcategory) data = await getProductsBySubcategory(subcategory, 1);
        else if (category) data = await getProductsByCategory(category, 1);
        else data = { results: [] };
        setItems(Array.isArray(data?.results) ? data.results : []);
      } catch (e) {
        setError(e?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [category, subcategory]);

  return (
    <div className="container productsPage">
      <div className="productsPage-header">
        <h1 className="productsPage-title">{label || subcategory || category || "Products"}</h1>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="productsGrid">
          {(items.length ? items : Array.from({ length: 8 })).map((p, idx) => {
            const v = p?.product_variations?.[0];
            const img = v?.product_images?.[0]?.product_image || "https://via.placeholder.com/260x180?text=Loading";
            const name = p?.product_name || "Loading…";
            const price = v?.get_discounted_price || v?.product_price || "";
            const slug = p?.slug || "#";
            return (
              <div className="productCard" key={p?.id || idx}>
                <a className="productCard-imgWrap" href={`/product/${slug}`}>
                  <img src={img} alt={name} className="productCard-img" />
                </a>
                <div className="productCard-body">
                  <div className="productCard-title" title={name}>
                    {name.length > 46 ? name.slice(0, 44) + "…" : name}
                  </div>
                  {price !== "" && <div className="productCard-price">₹{price}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



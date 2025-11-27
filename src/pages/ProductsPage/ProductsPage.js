import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  getProductsByCategory,
  getProductsBySubcategory,
  getAllProducts,
} from "../../api/products/CategoryProductsService";
import { ProductResultsExperience } from "../SearchPage/SearchResultsPage";
import "./ProductsPage.css";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function ProductsPage() {
  const history = useHistory();
  const q = useQuery();
  const category = q.get("category");
  const subcategory = q.get("subcategory");
  const label = q.get("label");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError("");
        }
        let data;
        if (subcategory) {
          data = await getProductsBySubcategory(subcategory, 1);
        } else if (category) {
          data = category === "all" ? await getAllProducts(1) : await getProductsByCategory(category, 1);
        } else {
          data = await getAllProducts(1);
        }
        if (isMounted) {
          setItems(Array.isArray(data?.results) ? data.results : []);
        }
      } catch (e) {
        if (isMounted) {
          setError(e?.message || "Failed to load products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, [category, subcategory]);

  const title = label || subcategory || category || "All products";

  return (
    <ProductResultsExperience
      title={title}
      subtitle={`Browse curated picks from ${title}`}
      query={title}
      mode="text"
      items={items}
      total={items.length}
      loading={loading}
      error={error}
      onProductClick={(product) => {
        if (!product) return;
        const target = product.slug || product.id;
        if (target) {
          history.push(`/product/${target}`);
        }
      }}
    />
  );
}



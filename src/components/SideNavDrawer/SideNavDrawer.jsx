import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./SideNavDrawer.css";
import { getAllCategories } from "../../api/products/CategoryService";
import { getCategorySubcategories } from "../../api/products/CategorySubCategoryService";
import { getTopSellingProducts } from "../../api/products/TopSellingService";
import { getFeaturedProducts } from "../../api/products/FeaturedProductService";
import { searchProducts } from "../../api/products/searchProduct/SearchProductService";
import { setCountry, selectCountry, COUNTRIES } from "../../features/country/countrySlice";

export default function SideNavDrawer({
  isOpen,
  onClose,
  onNavigate,    
  loggedIn = false,
  onSignOut,
  userName = "",      
}) {
  const dispatch = useDispatch();
  const selectedCountry = useSelector(selectCountry);
  const [deptOpen, setDeptOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [trendingOpen, setTrendingOpen] = useState(false);
  const [openCats, setOpenCats] = useState({});
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState({ bestSellers: [], newReleases: [] });
  const [departmentProducts, setDepartmentProducts] = useState({ clothing: [], shoes: [], jewelryWatches: [] });

  // Lock scroll + close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const goto = (href) => {
    onNavigate?.(href);
    onClose?.();
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const cats = await getAllCategories();
        if (isMounted) {
          setCategories(Array.isArray(cats) ? cats : []);
        }
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      }
      try {
        const subs = await getCategorySubcategories();
        if (isMounted) {
          setSubcategories(Array.isArray(subs) ? subs : []);
        }
      } catch {
        if (isMounted) {
          setSubcategories([]);
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Fetch trending products (best sellers and new releases)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Best sellers from top selling products
        const topSelling = await getTopSellingProducts(1);
        const topSellingArray = Array.isArray(topSelling) 
          ? topSelling 
          : (Array.isArray(topSelling?.results) ? topSelling.results : []);
        const bestSellers = topSellingArray.slice(0, 4).map(p => ({
          title: p.product_name || `Product ${p.id}`,
          slug: p.slug || p.id,
        }));

        // New releases from featured products
        const featured = await getFeaturedProducts(1);
        const featuredArray = Array.isArray(featured) 
          ? featured 
          : (Array.isArray(featured?.results) ? featured.results : []);
        const newReleases = featuredArray.slice(0, 4).map(p => ({
          title: p.product_name || `Product ${p.id}`,
          slug: p.slug || p.id,
        }));

        if (isMounted) {
          setTrendingProducts({ bestSellers, newReleases });
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Fetch department products
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Fetch products for different departments
        const [clothingRes, shoesRes, jewelryRes] = await Promise.all([
          searchProducts({ category: "fashion", page_size: 2 }).catch(() => ({ results: [] })),
          searchProducts({ category: "footwear", page_size: 2 }).catch(() => ({ results: [] })),
          searchProducts({ category: "jewelry", page_size: 2 }).catch(() => ({ results: [] })),
        ]);

        if (isMounted) {
          const clothingArray = Array.isArray(clothingRes) 
            ? clothingRes 
            : (Array.isArray(clothingRes?.results) ? clothingRes.results : []);
          const shoesArray = Array.isArray(shoesRes) 
            ? shoesRes 
            : (Array.isArray(shoesRes?.results) ? shoesRes.results : []);
          const jewelryArray = Array.isArray(jewelryRes) 
            ? jewelryRes 
            : (Array.isArray(jewelryRes?.results) ? jewelryRes.results : []);
          
          setDepartmentProducts({
            clothing: clothingArray.map(p => ({
              title: p.product_name || `Product ${p.id}`,
              slug: p.slug || p.id,
            })),
            shoes: shoesArray.map(p => ({
              title: p.product_name || `Product ${p.id}`,
              slug: p.slug || p.id,
            })),
            jewelryWatches: jewelryArray.map(p => ({
              title: p.product_name || `Product ${p.id}`,
              slug: p.slug || p.id,
            })),
          });
        }
      } catch (error) {
        console.error("Error fetching department products:", error);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Helper to get string value from category_name (handles both string and object)
  const getCategoryNameString = (categoryName) => {
    if (typeof categoryName === 'string') return categoryName;
    if (typeof categoryName === 'object' && categoryName !== null) {
      return categoryName.en || categoryName[Object.keys(categoryName)[0]] || '';
    }
    return '';
  };

  // Helper to get string value from sub_category (handles both string and object)
  const getSubCategoryString = (subCategory) => {
    if (typeof subCategory === 'string') return subCategory;
    if (typeof subCategory === 'object' && subCategory !== null) {
      return subCategory.en || subCategory[Object.keys(subCategory)[0]] || '';
    }
    return '';
  };

  const subsByCategory = subcategories.reduce((acc, sc) => {
    const key = getCategoryNameString(sc.category_name);
    if (!acc[key]) acc[key] = [];
    acc[key].push(sc);
    return acc;
  }, {});


  const HelpSettings = () => (
    <div className="snd-section snd-section--help">
      <div className="snd-sectionTitle">Help &amp; Settings</div>
      <ul className="snd-list">
        <li className="snd-row" onClick={() => goto("/account")}>
          <span className="snd-rowLabel">Your Account</span>
        </li>
        <li className="snd-row" onClick={() => goto("/language")}>
          <span className="snd-leadingIcon">🌐</span>
          <span className="snd-rowLabel">English</span>
        </li>
        <li 
          className="snd-row snd-row-country"
          onClick={() => setShowCountryMenu(!showCountryMenu)}
        >
          <span className="snd-leadingIcon">{selectedCountry.flag}</span>
          <span className="snd-rowLabel">{selectedCountry.name} ({selectedCountry.currency})</span>
          <span className={`snd-caret ${showCountryMenu ? "snd-caret--up" : ""}`}>▾</span>
        </li>
        {showCountryMenu && (
          <li className="snd-country-menu">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                className={`snd-country-item ${country.code === selectedCountry.code ? "is-active" : ""}`}
                onClick={() => {
                  dispatch(setCountry(country.code));
                  setShowCountryMenu(false);
                }}
              >
                <span className="snd-country-flag">{country.flag}</span>
                <span className="snd-country-name">{country.name}</span>
                <span className="snd-country-currency">{country.currency}</span>
              </button>
            ))}
          </li>
        )}
        <li className="snd-row" onClick={() => goto("/help")}>
          <span className="snd-rowLabel">Customer Service</span>
        </li>
        <li
          className={`snd-row ${loggedIn ? "snd-row--danger" : ""}`}
          onClick={() => {
            if (loggedIn) onSignOut?.();
            goto("/login");
          }}
        >
          <span className="snd-rowLabel">{loggedIn ? "Sign Out" : "Sign in"}</span>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      <div
        className={`snd-overlay ${isOpen ? "snd-overlay--visible" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`snd-drawer ${isOpen ? "snd-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="snd-header">
          <div className="snd-avatar" aria-hidden="true">👤</div>
          <div className="snd-helloWrap">
            <div className="snd-hello">
              {loggedIn ? `Hello, ${userName || "User"}` : "Hello, sign in"}
            </div>
            <div className="snd-tagline">
              Personalize HyderNexa and pick up where you left off.
            </div>
          </div>
          <button className="snd-close" aria-label="Close menu" onClick={onClose}>
            <span className="snd-closeX" aria-hidden>✕</span>
          </button>
        </div>

        <div className="snd-quickActions">
          <button onClick={() => goto("/orders")}>Your orders</button>
          <button onClick={() => goto("/account")}>Account</button>
          <button onClick={() => goto("/wishlists")}>Wishlists</button>
        </div>

        {/* Scroll body */}
        <div className="snd-scroll">
          {/* Trending */}
          <div className="snd-section">
            <div className="snd-sectionTitle">Trending</div>
            <ul className="snd-list">
              <li className="snd-row snd-row--chev" onClick={() => goto("/best-sellers")}>
                <span className="snd-rowLabel">Best Sellers</span>
                <span className="snd-chev">›</span>
              </li>
              <li className="snd-row snd-row--chev" onClick={() => goto("/new-releases")}>
                <span className="snd-rowLabel">New Releases</span>
                <span className="snd-chev">›</span>
              </li>
              {trendingOpen && (
                <>
                  {trendingProducts.bestSellers.map((it, idx) => (
                    <li key={`bs-${it.slug || idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel">{it.title}</span>
                    </li>
                  ))}
                  {trendingProducts.newReleases.map((it, idx) => (
                    <li key={`nr-${it.slug || idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel">{it.title}</span>
                    </li>
                  ))}
                </>
              )}
              <li
                className="snd-row snd-row--seeall"
                onClick={() => setTrendingOpen((v) => !v)}
              >
                <span className="snd-rowLabel">{trendingOpen ? "Hide items" : "See items"}</span>
                <span className={`snd-caret ${trendingOpen ? "snd-caret--up" : ""}`}>▾</span>
              </li>
            </ul>
          </div>

          <div className="snd-divider" />

          {/* Digital Content & Devices */}
        

          <div className="snd-divider" />

          {/* Shop by Department with "See all" */}
          <div className="snd-section">
            <div className="snd-sectionTitle">Shop by Department</div>
            <ul className="snd-list">
              <li
                className="snd-row snd-row--chev"
                onClick={()  =>
                  goto("/products?category=mens-fashion&label=Clothing%2C%20Shoes%2C%20Jewelry%20%26%20Watches")
                }
              >
                <span className="snd-rowLabel">Clothing, Shoes, Jewelry &amp; Watches</span>
                <span className="snd-chev">›</span>
              </li>
              <li className="snd-row snd-row--chev" onClick={() => goto("/whole-foods-market")}>
                <span className="snd-rowLabel">Whole Foods Market</span>
                <span className="snd-chev">›</span>
              </li>
              {/* Dynamic Categories with nested subcategories */}
              {categories.map((cat) => {
                const categoryNameStr = getCategoryNameString(cat.category_name);
                const href = `/products?category=${encodeURIComponent(cat.slug)}&label=${encodeURIComponent(categoryNameStr)}`;
                const subs = subsByCategory[categoryNameStr] || [];
                const isOpen = !!openCats[cat.id];
                return (
                  <React.Fragment key={cat.id}>
                    {subs.length === 0 ? (
                      <li className="snd-row snd-row--chev" onClick={() => goto(href)}>
                        <span className="snd-rowLabel">{categoryNameStr}</span>
                        <span className="snd-chev">›</span>
                      </li>
                    ) : (
                      <>
                        <li
                          className="snd-row snd-row--chev"
                          onClick={() => setOpenCats((s) => ({ ...s, [cat.id]: !s[cat.id] }))}
                        >
                          <span className="snd-rowLabel">{categoryNameStr}</span>
                          <span className={`snd-caret ${isOpen ? "snd-caret--up" : ""}`}>▾</span>
                        </li>
                        {(deptOpen || isOpen) && (
                          <li className="snd-row" onClick={() => goto(href)}>
                            <span className="snd-rowLabel" style={{ paddingLeft: '20px', fontStyle: 'italic', color: 'var(--snd-accent)' }}>View all in {categoryNameStr}</span>
                          </li>
                        )}
                        {(deptOpen || isOpen) && subs.map((sc) => {
                          const subCategoryStr = getSubCategoryString(sc.sub_category);
                          const shref = `/products?subcategory=${encodeURIComponent(sc.slug)}&label=${encodeURIComponent(subCategoryStr)}`;
                          return (
                            <li key={`${cat.id}-${sc.id}`} className="snd-row" onClick={() => goto(shref)}>
                              <span className="snd-rowLabel" style={{ paddingLeft: '20px' }}>{subCategoryStr}</span>
                            </li>
                          );
                        })}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
              {deptOpen && (
                <>
                  {/* Featured items per department */}
                  {departmentProducts.clothing.map((it, idx) => (
                    <li key={`clo-${it.slug || idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel" style={{ paddingLeft: '20px' }}>{it.title}</span>
                    </li>
                  ))}
                  {departmentProducts.shoes.map((it, idx) => (
                    <li key={`sho-${it.slug || idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel" style={{ paddingLeft: '20px' }}>{it.title}</span>
                    </li>
                  ))}
                  {departmentProducts.jewelryWatches.map((it, idx) => (
                    <li key={`jew-${it.slug || idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel" style={{ paddingLeft: '20px' }}>{it.title}</span>
                    </li>
                  ))}
                  <li className="snd-row snd-row--chev" onClick={() => goto("/hydernexa-fresh")}>
                    <span className="snd-rowLabel">HyderNexa Fresh</span>
                    <span className="snd-chev">›</span>
                  </li>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/hydernexa-market")}>
                    <span className="snd-rowLabel">HyderNexa Market</span>
                    <span className="snd-chev">›</span>
                  </li>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/books")}>
                    <span className="snd-rowLabel">Books</span>
                    <span className="snd-chev">›</span>
                  </li>
                </>
              )}
              <li
                className="snd-row snd-row--seeall"
                onClick={() => setDeptOpen((v) => !v)}
              >
                <span className="snd-rowLabel">See all</span>
                <span className={`snd-caret ${deptOpen ? "snd-caret--up" : ""}`}>▾</span>
              </li>
            </ul>
          </div>

          <div className="snd-divider" />

          {/* Programs & Features with "See all" */}
          <div className="snd-section">
            <div className="snd-sectionTitle">Programs &amp; Features</div>
            <ul className="snd-list">
              <li
                className="snd-row snd-row--chev"
                onClick={() =>
                  goto("/products?category=medical-pharmacy&label=Medical%20Care%20%26%20Pharmacy")
                }
              >
                <span className="snd-rowLabel">Medical Care &amp; Pharmacy</span>
                <span className="snd-chev">›</span>
              </li>
            </ul>
          </div>

          <div className="snd-divider" />

          <HelpSettings />
        </div>
      </aside>
    </>
  );
}

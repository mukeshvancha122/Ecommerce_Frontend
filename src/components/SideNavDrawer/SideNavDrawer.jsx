import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./SideNavDrawer.css";
import { getAllCategories } from "../../api/products/CategoryService";
import { getCategorySubcategories } from "../../api/products/CategorySubCategoryService";
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
  const [programsOpen, setProgramsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [trendingOpen, setTrendingOpen] = useState(false);
  const [openCats, setOpenCats] = useState({});
  const [showCountryMenu, setShowCountryMenu] = useState(false);

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
    (async () => {
      try {
        const cats = await getAllCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCategories([]);
      }
      try {
        const subs = await getCategorySubcategories();
        setSubcategories(Array.isArray(subs) ? subs : []);
      } catch {
        setSubcategories([]);
      }
    })();
  }, []);

  const subsByCategory = subcategories.reduce((acc, sc) => {
    const key = sc.category_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sc);
    return acc;
  }, {});

  // Dummy data for Trending and Departments
  const dummyTrending = {
    bestSellers: [
      { title: "Ultra Comfort Gaming Chair", slug: "ultra-comfort-gaming-chair" },
      { title: "Noise Cancelling Earbuds", slug: "noise-cancelling-earbuds" },
    ],
    newReleases: [
      { title: "5G Android Smartphone", slug: "5g-android-smartphone" },
      { title: "14-inch Thin Laptop", slug: "14-inch-thin-laptop" },
    ],
  };

  const dummyDepartment = {
    clothing: [
      { title: "Slim Fit Casual Shirt", slug: "slim-fit-casual-shirt" },
    ],
    shoes: [
      { title: "Classic Formal Shoes", slug: "classic-formal-shoes" },
    ],
    jewelryWatches: [
      { title: "Leather Handbag", slug: "leather-handbag" },
    ],
  };

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
                  {dummyTrending.bestSellers.map((it, idx) => (
                    <li key={`bs-${idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel">{it.title}</span>
                    </li>
                  ))}
                  {dummyTrending.newReleases.map((it, idx) => (
                    <li key={`nr-${idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
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
                const href = `/products?category=${encodeURIComponent(cat.slug)}&label=${encodeURIComponent(cat.category_name)}`;
                const subs = subsByCategory[cat.category_name] || [];
                const isOpen = !!openCats[cat.id];
                return (
                  <React.Fragment key={cat.id}>
                    {subs.length === 0 ? (
                      <li className="snd-row snd-row--chev" onClick={() => goto(href)}>
                        <span className="snd-rowLabel">{cat.category_name}</span>
                        <span className="snd-chev">›</span>
                      </li>
                    ) : (
                      <>
                        <li
                          className="snd-row snd-row--chev"
                          onClick={() => setOpenCats((s) => ({ ...s, [cat.id]: !s[cat.id] }))}
                        >
                          <span className="snd-rowLabel">{cat.category_name}</span>
                          <span className={`snd-caret ${isOpen ? "snd-caret--up" : ""}`}>▾</span>
                        </li>
                        {(deptOpen || isOpen) && (
                          <li className="snd-row" onClick={() => goto(href)}>
                            <span className="snd-rowLabel" style={{ paddingLeft: '20px', fontStyle: 'italic', color: 'var(--snd-accent)' }}>View all in {cat.category_name}</span>
                          </li>
                        )}
                        {(deptOpen || isOpen) && subs.map((sc) => {
                          const shref = `/products?subcategory=${encodeURIComponent(sc.slug)}&label=${encodeURIComponent(sc.sub_category)}`;
                          return (
                            <li key={`${cat.id}-${sc.id}`} className="snd-row" onClick={() => goto(shref)}>
                              <span className="snd-rowLabel" style={{ paddingLeft: '20px' }}>{sc.sub_category}</span>
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
                  {/* Featured items per department (dummy) */}
                  {dummyDepartment.clothing.map((it, idx) => (
                    <li key={`clo-${idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel" style={{ paddingLeft: '20px' }}>{it.title}</span>
                    </li>
                  ))}
                  {dummyDepartment.shoes.map((it, idx) => (
                    <li key={`sho-${idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel" style={{ paddingLeft: '20px' }}>{it.title}</span>
                    </li>
                  ))}
                  {dummyDepartment.jewelryWatches.map((it, idx) => (
                    <li key={`jew-${idx}`} className="snd-row" onClick={() => goto(`/product/${it.slug}`)}>
                      <span className="snd-rowLabel" style={{ paddingLeft: '20px' }}>{it.title}</span>
                    </li>
                  ))}
                  <li className="snd-row snd-row--chev" onClick={() => goto("/hydernexa-fresh")}>
                    <span className="snd-rowLabel">HyderNexa Fresh</span>
                    <span className="snd-chev">›</span>
                  </li>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/whole-foods-market")}>
                    <span className="snd-rowLabel">Whole Foods Market</span>
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
              {programsOpen && (
                <>
                 
                </>
              )}
             
            </ul>
          </div>

          <div className="snd-divider" />

          <HelpSettings />
        </div>
      </aside>
    </>
  );
}

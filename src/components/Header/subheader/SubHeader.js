import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../features/auth/AuthSlice";
import { useHistory } from "react-router-dom";
import "./SubHeader.css";
import SideNavDrawer from "../../SideNavDrawer/SideNavDrawer";
import { getAllCategories } from "../../../api/products/CategoryService";
import { getCategorySubcategories } from "../../../api/products/CategorySubCategoryService";

function SubHeader() {
  const history = useHistory();
  const user = useSelector(selectUser);
  const [showSideNav, setShowSideNav] = useState(false);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (!showSideNav) return;
    const handleEsc = (e) => e.key === "Escape" && setShowSideNav(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showSideNav]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategorySubcategories();
        setSubcategories(Array.isArray(data) ? data : []);
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

  const onSubcategoryClick = (e, sc) => {
    e.preventDefault();
    history.push(`/products?subcategory=${encodeURIComponent(sc.slug)}&label=${encodeURIComponent(sc.sub_category)}`);
  };

  return (
    <>
      {/* ======= SUBHEADER NAV ======= */}
      <nav className="subHeader">
        <ul className="subHeader-row">
          <li className="subHeader-item subHeader-item--all">
            <button
              className="subHeader-allBtn"
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={showSideNav}
            >
              <span className="subHeader-allIcon" aria-hidden="true">☰</span>
              <span className="subHeader-allText">All</span>
            </button>
          </li>

          {/* ======= MAIN NAV LINKS ======= */}
          <li className="subHeader-item">
            <a className="subHeader-link" href="/holiday-deals">
              Holiday Deals
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/best-sellers">
              Best Sellers
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/new-arrivals">
              New Arrivals <span className="subHeader-caret">▾</span>
            </a>
          </li>

          {categories.map((cat) => {
            const subs = subsByCategory[cat.category_name] || [];
            const hasSubs = subs.length > 0;
            return (
              <li className={`subHeader-item${hasSubs ? " hasDropdown" : ""}`} key={cat.id}>
                <a
                  className="subHeader-link"
                  href={`/products?category=${encodeURIComponent(cat.slug)}&label=${encodeURIComponent(cat.category_name)}`}
                >
                  {cat.category_name}
                  {hasSubs && <span className="subHeader-caret">▾</span>}
                </a>
                {hasSubs && (
                  <div className="subHeader-dropdown" role="menu" aria-label={`${cat.category_name} subcategories`}>
                    {subs.map((sc) => (
                      <a
                        key={sc.id}
                        className="subHeader-dropdownLink"
                        href={`/products?subcategory=${encodeURIComponent(sc.slug)}&label=${encodeURIComponent(sc.sub_category)}`}
                        onClick={(e) => onSubcategoryClick(e, sc)}
                        role="menuitem"
                      >
                        {sc.sub_category}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

     <SideNavDrawer
  isOpen={open}
  onClose={() => setOpen(false)}
  loggedIn={!!user}
  userName={(user?.name && user.name.trim()) || (user?.email || "").split("@")[0]}
  onSignOut={() => {
    // call your logout endpoint here, then navigate
    // axios.post('/api/auth/logout', {}, { withCredentials: true }).finally(...)
  }}
  onNavigate={(href) => {
    try {
      history.push(href);
    } catch {
      window.location.href = href;
    }
  }}
/>
    </>
  );
}

export default SubHeader;

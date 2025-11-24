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
    let isMounted = true;
    (async () => {
      try {
        const data = await getAllCategories();
        if (isMounted) {
          // Ensure we have a valid array and filter out any invalid entries
          const validCategories = Array.isArray(data) 
            ? data.filter(cat => cat && typeof cat === 'object' && (cat.id || cat.slug))
            : [];
          setCategories(validCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (isMounted) {
          setCategories([]);
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getCategorySubcategories();
        if (isMounted) {
          // Ensure we have a valid array and filter out any invalid entries
          const validSubcategories = Array.isArray(data) 
            ? data.filter(sub => sub && typeof sub === 'object' && (sub.id || sub.slug))
            : [];
          setSubcategories(validSubcategories);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        if (isMounted) {
          setSubcategories([]);
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Helper to get string value from category_name (handles both string and object)
  const getCategoryNameString = (categoryName) => {
    if (typeof categoryName === 'string') return categoryName;
    if (typeof categoryName === 'object' && categoryName !== null) {
      // Try to get the current language value or fallback to 'en'
      return categoryName.en || categoryName[Object.keys(categoryName)[0]] || '';
    }
    return '';
  };

  // Helper to get string value from sub_category (handles both string and object)
  const getSubCategoryString = (subCategory) => {
    if (typeof subCategory === 'string') return subCategory;
    if (subCategory === null || subCategory === undefined) return '';
    if (typeof subCategory === 'object') {
      // Handle translation objects (e.g., {en: "Electronics", hi: "इलेक्ट्रॉनिक्स"})
      if (subCategory.en && typeof subCategory.en === 'string') return subCategory.en;
      // Try other language keys
      const langKeys = ['hi', 'de', 'es', 'fr'];
      for (const lang of langKeys) {
        if (subCategory[lang] && typeof subCategory[lang] === 'string') {
          return subCategory[lang];
        }
      }
      // Try first string value in object
      for (const key in subCategory) {
        if (typeof subCategory[key] === 'string' && key !== 'slug' && key !== 'id' && 
            !Array.isArray(subCategory[key]) && typeof subCategory[key] !== 'object') {
          return subCategory[key];
        }
      }
      // Handle objects with sub_category_name property
      if (subCategory.sub_category_name) {
        const name = subCategory.sub_category_name;
        if (typeof name === 'string') return name;
        if (typeof name === 'object') return getSubCategoryString(name);
      }
      // Last resort: return empty string to avoid rendering object
      return '';
    }
    return String(subCategory || '');
  };

  const subsByCategory = subcategories.reduce((acc, sc) => {
    const key = getCategoryNameString(sc.category_name);
    if (!acc[key]) acc[key] = [];
    acc[key].push(sc);
    return acc;
  }, {});

  const onSubcategoryClick = (e, sc) => {
    e.preventDefault();
    const subCategoryLabel = getSubCategoryString(sc.sub_category);
    history.push(`/products?subcategory=${encodeURIComponent(sc.slug)}&label=${encodeURIComponent(subCategoryLabel)}`);
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
            const categoryNameStr = getCategoryNameString(cat.category_name);
            const subs = subsByCategory[categoryNameStr] || [];
            const hasSubs = subs.length > 0;
            return (
              <li className={`subHeader-item${hasSubs ? " hasDropdown" : ""}`} key={cat.id}>
                <a
                  className="subHeader-link"
                  href={`/products?category=${encodeURIComponent(cat.slug)}&label=${encodeURIComponent(categoryNameStr)}`}
                >
                  {categoryNameStr}
                  {hasSubs && <span className="subHeader-caret">▾</span>}
                </a>
                {hasSubs && (
                  <div className="subHeader-dropdown" role="menu" aria-label={`${categoryNameStr} subcategories`}>
                    {subs.map((sc) => {
                      const subCategoryStr = getSubCategoryString(sc.sub_category);
                      return (
                        <a
                          key={sc.id}
                          className="subHeader-dropdownLink"
                          href={`/products?subcategory=${encodeURIComponent(sc.slug)}&label=${encodeURIComponent(subCategoryStr)}`}
                          onClick={(e) => onSubcategoryClick(e, sc)}
                          role="menuitem"
                        >
                          {subCategoryStr}
                        </a>
                      );
                    })}
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

import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import "./SearchResultPage.css";
import { getProductImageUrl } from "../../utils/imageUtils";

const SearchResultsPage = () => {
  const location = useLocation();
  const history = useHistory();

  const {
    mode = "text",
    query = "",
    results = [],
    total = 0,
    previewImageUrl,
  } = location.state || {};

  const handleOpenProduct = (product) => {
    const target = product?.id ?? product?.slug;
    if (!target) return;
    history.push(`/product/${target}`);
  };

  const headingText =
    mode === "image"
      ? "Results from your image"
      : `Showing results for ${query || "your search"}`;

  return (
    <div className="srpPage">
      <div className="srpHeader">
        <h1 className="srpTitle">Results</h1>
        <p className="srpSubtitle">
          Check each product page for other buying options.
        </p>

        <div className="srpContextRow">
          <span className="srpContextHeading">{headingText}</span>
          {total > 0 && (
            <span className="srpContextCount">
              {total} product{total !== 1 ? "s" : ""} found
            </span>
          )}
        </div>

        {mode === "image" && previewImageUrl && (
          <div className="srpImageContext">
            <span>Search image:</span>
            <img src={previewImageUrl} alt="Search preview" />
          </div>
        )}
      </div>

      <div className="srpGrid">
        {results.map((p) => {
          const mainVariation = p.product_variations?.[0];
          const mainImage = getProductImageUrl(p, "");
          const price = mainVariation?.product_price;
          const discounted = mainVariation?.get_discounted_price;
          const rating = p.get_rating_info;

          return (
            <article
              key={p.id}
              className="srpCard"
              onClick={() => handleOpenProduct(p)}
            >
              <div className="srpCardImageWrapper">
                {mainImage ? (
                  <img src={mainImage} alt={p.product_name} />
                ) : (
                  <div className="srpImagePlaceholder">No image</div>
                )}
                {p.best_seller && (
                  <span className="srpBadge srpBadgeBestSeller">
                    Best seller
                  </span>
                )}
                {p.handpicked && (
                  <span className="srpBadge srpBadgePick">Our pick</span>
                )}
              </div>

              <div className="srpCardBody">
                <h2 className="srpProductName">{p.product_name}</h2>
                <div className="srpBrand">{p.brand?.brand_name}</div>

                {rating && (
                  <div className="srpRatingRow">
                    <span className="srpStar">★</span>
                    <span className="srpRatingValue">{rating}</span>
                    <span className="srpStoreName">mystore</span>
                  </div>
                )}

                <div className="srpPriceRow">
                  {discounted ? (
                    <>
                      <span className="srpPrice">₹{discounted}</span>
                      {price && (
                        <span className="srpMRP">₹{price}</span>
                      )}
                    </>
                  ) : (
                    price && <span className="srpPrice">₹{price}</span>
                  )}
                </div>

                <p className="srpDescription">
                  {p.product_description || "Product description not available."}
                </p>

                <button
                  type="button"
                  className="srpViewBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProduct(p);
                  }}
                >
                  View product
                </button>
              </div>
            </article>
          );
        })}

        {results.length === 0 && (
          <div className="srpEmpty">
            No products found. Try a different search term or category.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
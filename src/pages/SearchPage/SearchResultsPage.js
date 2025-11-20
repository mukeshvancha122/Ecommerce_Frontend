import { useLocation, useHistory } from "react-router-dom";
import "./SearchResultsPage.css";

const SearchResultsPage = () => {
  const location = useLocation();
  const history = useHistory();

  const {
    mode = "text",
    query = "",
    category = "all",
    subcategory = "all",
    previewImageUrl,
    results = [],
    total = 0,
  } = location.state || {};

  const handleCardClick = (product) => {
    // navigate to product detail page
    history.push(`/product/${product.slug || product.id}`);
  };

  const headingCategory =
    subcategory && subcategory !== "all"
      ? subcategory
      : category && category !== "all"
      ? category
      : "";

  return (
    <div className="searchResultsPage">
      <div className="searchResultsHeader">
        <h1 className="searchResultsTitle">Results</h1>
        <p className="searchResultsSub">
          Check each product page for other buying options. Price and other
          details may vary based on product size and color.
        </p>

        <p className="searchResultsMeta">
          {mode === "text" && query && (
            <>
              Showing results for <strong>{query}</strong>
              {headingCategory && (
                <>
                  {" "}
                  in <strong>{headingCategory}</strong>
                </>
              )}
              {typeof total === "number" && (
                <>
                  {" "}
                  • <strong>{total}</strong> products found
                </>
              )}
            </>
          )}

          {mode === "image" && (
            <>
              Showing visually similar results
              {typeof total === "number" && (
                <>
                  {" "}
                  • <strong>{total}</strong> products found
                </>
              )}
            </>
          )}
        </p>

        {mode === "image" && previewImageUrl && (
          <div className="searchResultsImagePreview">
            <span className="searchResultsImageLabel">Your image</span>
            <img src={previewImageUrl} alt="uploaded" />
          </div>
        )}
      </div>

      <div className="searchResultsGrid">
        {results.map((product) => {
          const variation = product.product_variations?.[0];
          const mainImage =
            variation?.product_images?.[0]?.product_image ||
            "https://via.placeholder.com/300x300?text=Product";
          const price = variation?.product_price;
          const discounted = variation?.get_discounted_price;
          const rating = product.get_rating_info;
          const brandName = product.brand?.brand_name;

          return (
            <div
              key={product.id}
              className="searchResultCard"
              onClick={() => handleCardClick(product)}
            >
              <div className="searchResultImageWrapper">
                <img src={mainImage} alt={product.product_name} />
                {product.best_seller && (
                  <span className="searchResultBadge">Best Seller</span>
                )}
              </div>

              <div className="searchResultInfo">
                <div className="searchResultTitle">
                  {product.product_name}
                </div>
                {brandName && (
                  <div className="searchResultBrand">by {brandName}</div>
                )}

                {rating && (
                  <div className="searchResultRating">
                    <span className="searchResultRatingScore">{rating}</span>
                    <span className="searchResultRatingStar">★</span>
                    <span className="searchResultRatingStore"> myStore</span>
                  </div>
                )}

                <div className="searchResultPriceRow">
                  {discounted ? (
                    <>
                      <span className="searchResultPrice">
                        ₹{discounted}
                      </span>
                      {price && (
                        <span className="searchResultOldPrice">
                          ₹{price}
                        </span>
                      )}
                    </>
                  ) : (
                    price && (
                      <span className="searchResultPrice">
                        ₹{price}
                      </span>
                    )
                  )}
                </div>

                <p className="searchResultDesc">
                  {product.product_description}
                </p>

                <button
                  type="button"
                  className="searchResultButton"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(product);
                  }}
                >
                  View product
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {results.length === 0 && (
        <div className="searchResultsEmpty">
          No products found. Try a different keyword or category.
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
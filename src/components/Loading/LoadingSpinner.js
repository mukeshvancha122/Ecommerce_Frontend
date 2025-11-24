import React from "react";
import "./LoadingSpinner.css";


export function LoadingSpinner({ 
  size = "large", 
  message = "Loading...", 
  fullScreen = false 
}) {
  return (
    <div className={`loading-container ${fullScreen ? 'loading-fullscreen' : ''}`}>
      <div className="loading-content">
        <div className={`loading-spinner loading-spinner--${size}`}>
          <div className="loading-spinner__ring">
            <div className="loading-spinner__ring-inner"></div>
          </div>
          <div className="loading-spinner__logo">
            <svg viewBox="0 0 200 200" className="loading-logo">
              <path
                d="M50 100 L80 70 L130 70 L160 100 L130 130 L80 130 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="loading-logo-path"
              />
              <text
                x="100"
                y="105"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill="currentColor"
                className="loading-logo-text"
              >
                HN
              </text>
            </svg>
          </div>
        </div>
        {message && (
          <p className="loading-message">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for product cards
 */
export function ProductCardSkeleton({ count = 4 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-line--title"></div>
            <div className="skeleton-line skeleton-line--price"></div>
            <div className="skeleton-line skeleton-line--rating"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Page loading overlay
 */
export function PageLoader({ message = "Loading your experience..." }) {
  return (
    <div className="page-loader">
      <LoadingSpinner size="large" message={message} />
    </div>
  );
}

// Default export for backward compatibility
export default LoadingSpinner;


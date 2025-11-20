import React, { useEffect, useMemo, useState } from "react";
import "./ProductGallery.css";

export default function ProductGallery({ images = [], alt = "" }) {
  const media = useMemo(() => {
    const filtered = images.filter(Boolean);
    return filtered.length ? filtered : ["/images/NO_IMG.png"];
  }, [images]);
  const [active, setActive] = useState(media[0]);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setActive(media[0]);
  }, [media]);

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <section className="gallery card" aria-label="Product media">
      <div
        className={`gallery__stage ${zoomActive ? "is-zoom" : ""}`}
        onMouseEnter={() => setZoomActive(true)}
        onMouseLeave={() => setZoomActive(false)}
        onMouseMove={handleMove}
      >
        <img className="gallery__hero" src={active} alt={alt} loading="eager" />
        {zoomActive && (
          <div
            className="gallery__zoom"
            style={{
              backgroundImage: `url(${active})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
            aria-hidden
          />
        )}
      </div>

      <div className="gallery__thumbs" role="list">
        {media.map((src, index) => (
          <button
            key={src + index}
            className={`gallery__thumb ${active === src ? "is-active" : ""}`}
            onClick={() => setActive(src)}
            aria-label={`Show image ${index + 1}`}
          >
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </section>
  );
}

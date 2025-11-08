import React, { useMemo, useState } from "react";
import "./ProductGallery.css";

export default function ProductGallery({ hero, images=[], alt }) {
  const all = useMemo(() => [hero, ...images].filter(Boolean), [hero, images]);
  const [active, setActive] = useState(all[0]);

  return (
    <section className="gallery card" aria-label="Product media">
      <div className="gallery__stage">
        <img className="gallery__hero" src={active} alt={alt} loading="eager" />
      </div>
      <div className="gallery__thumbs" role="list">
        {all.map((src, i) => (
          <button
            key={src+i}
            className={`gallery__thumb ${active===src ? "is-active":""}`}
            onClick={() => setActive(src)}
            aria-label={`Show image ${i+1}`}
          >
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </section>
  );
}

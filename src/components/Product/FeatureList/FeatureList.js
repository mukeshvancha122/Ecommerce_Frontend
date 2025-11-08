import React from "react";
import "./FeatureList.css";

export default function FeatureList({ title, bullets=[] }) {
  return (
    <section className="card features" aria-labelledby="about-item">
      <h2 id="about-item" className="features__title">{title}</h2>
      <ul className="features__list">
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </section>
  );
}
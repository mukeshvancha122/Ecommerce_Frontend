import React from "react";
import "./SectionWrapper.css";

export default function SectionWrapper({ children, className = "" }) {
  return (
    <section className={`sectionWrapper ${className}`}>
      <div className="sectionWrapper-inner">{children}</div>
    </section>
  );
}

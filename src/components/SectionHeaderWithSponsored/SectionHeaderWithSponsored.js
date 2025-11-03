import React from "react";
import "./SectionHeaderWithSponsored.css";

export default function SectionHeaderWithSponsored({
  title,
  sponsored = false,
}) {
  return (
    <div className="sectionHead">
      <div className="sectionHead-left">{title}</div>
      {sponsored && (
        <div className="sectionHead-right">Sponsored • i</div>
      )}
    </div>
  );
}

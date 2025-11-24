import React from "react";
import "./GridSectionGrid.css";
import GiftSectionCard from "./GitftSectionCard";

export default function GiftSectionGrid() {
  return (
    <>
      <GiftSectionCard
        title="Shop gifts by price"
        footerText="Discover more for Holiday"
        tiles={[
          {
            img: "/images/NO_IMG.png",
            label: "Under $10",
          },
          {
            img: "/images/NO_IMG.png",
            label: "Under $25",
          },
          {
            img: "/images/NO_IMG.png",
            label: "Under $50",
          },
          {
            img: "/images/NO_IMG.png",
            label: "Deals",
          },
        ]}
      />

      {/* COLUMN 2 */}
      <GiftSectionCard
        title="Find gifts for everyone"
        footerText="Discover more for Holiday"
        tiles={[
          {
            img: "/images/NO_IMG.png",
            label: "For her",
          },
          {
            img: "/images/NO_IMG.png",
            label: "For him",
          },
          {
            img: "/images/NO_IMG.png",
            label: "For kids",
          },
          {
            img: "/images/NO_IMG.png",
            label: "For teens",
          },
        ]}
      />

      {/* COLUMN 3 */}
      <GiftSectionCard
        title="Shop gifts by category"
        footerText="Discover more for Holiday"
        tiles={[
          {
            img: "/images/NO_IMG.png",
            label: "Toys",
          },
          {
            img: "/images/NO_IMG.png",
            label: "Home & kitchen",
          },
          {
            img: "/images/NO_IMG.png",
            label: "Electronics",
          },
          {
            img: "/images/NO_IMG.png",
            label: "Sports & outdoors",
          },
        ]}
      />
    </>
  );
}
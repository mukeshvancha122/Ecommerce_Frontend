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
            img: "https://via.placeholder.com/140x100/aa0077/ffffff?text=%24%3C10",
            label: "Under $10",
          },
          {
            img: "https://via.placeholder.com/140x100/fcd535/000000?text=%24%3C25",
            label: "Under $25",
          },
          {
            img: "https://via.placeholder.com/140x100/fc008b/ffffff?text=%24%3C50",
            label: "Under $50",
          },
          {
            img: "https://via.placeholder.com/140x100/ff66cc/000000?text=Deals",
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
            img: "https://via.placeholder.com/140x100/cc0033/ffffff?text=Her",
            label: "For her",
          },
          {
            img: "https://via.placeholder.com/140x100/00b59a/ffffff?text=Him",
            label: "For him",
          },
          {
            img: "https://via.placeholder.com/140x100/00aaff/ffffff?text=Kids",
            label: "For kids",
          },
          {
            img: "https://via.placeholder.com/140x100/3344ff/ffffff?text=Teens",
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
            img: "https://via.placeholder.com/140x100/d32f2f/ffffff?text=Toys",
            label: "Toys",
          },
          {
            img: "https://via.placeholder.com/140x100/ffb3b3/000000?text=Home",
            label: "Home & kitchen",
          },
          {
            img: "https://via.placeholder.com/140x100/9900ff/ffffff?text=Electronics",
            label: "Electronics",
          },
          {
            img: "https://via.placeholder.com/140x100/0099ff/ffffff?text=Sports",
            label: "Sports & outdoors",
          },
        ]}
      />
    </>
  );
}
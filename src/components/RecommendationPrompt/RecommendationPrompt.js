import React from "react";
import "./RecommendationPrompt.css";

const RecommendationPrompt = ({ isLoggedIn }) => {
  if (isLoggedIn) return null; // don’t render if the user is logged in

  return (
    <section className="recommendationPrompt">
      <div className="recommendationPrompt-inner">
        <h2 className="recommendationPrompt-title">
          See personalized recommendations
        </h2>

        <button className="recommendationPrompt-signinBtn">Sign in</button>

        <div className="recommendationPrompt-footer">
          New customer?{" "}
          <a href="/register" className="recommendationPrompt-link">
            Start here.
          </a>
        </div>
      </div>
    </section>
  );
};

export default RecommendationPrompt;

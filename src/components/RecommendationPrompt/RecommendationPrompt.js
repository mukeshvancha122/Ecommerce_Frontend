import React from "react";
import "./RecommendationPrompt.css";

const RecommendationPrompt = ({ isLoggedIn, onSignIn }) => {
  if (isLoggedIn) return null;

  return (
    <section className="recommendationPrompt">
      <div className="recommendationPrompt-inner">
        <h2 className="recommendationPrompt-title">
          See personalized recommendations
        </h2>

        <button
          className="recommendationPrompt-signinBtn"
          type="button"
          onClick={onSignIn}
        >
          Sign in
        </button>

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

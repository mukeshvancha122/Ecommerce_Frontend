// src/pages/auth/Login.js
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrMsg("Please enter email and password.");
      return;
    }

    try {
      setSubmitting(true);
      setErrMsg("");

      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // store auth
      if (res?.data?.token) {
        localStorage.setItem("authToken", res.data.token);
      }
      if (res?.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      history.push("/");
    } catch (err) {
      console.error(err);
      setErrMsg(
        err?.response?.data?.message ||
          "We couldn't sign you in. Double-check your email/password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="authPage">
      {/* header logo */}
      <Link to="/" className="authPage-logoWrapper">
        {/* swap this for your brand mark */}
        <img
          className="authPage-logo"
          src="/yourshop-dark.svg"
          alt="yourshop"
        />
      </Link>

      {/* card */}
      <div className="authCard">
        <h1 className="authCard-title">Sign in</h1>

        <form className="authForm" onSubmit={handleSignIn}>
          <label className="authField">
            <span className="authField-label">Email</span>
            <input
              className="authField-input"
              type="email"
              name="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </label>

          <label className="authField">
            <span className="authField-label">Password</span>
            <input
              className="authField-input"
              type="password"
              name="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </label>

          {errMsg && <div className="authError">{errMsg}</div>}

          <button
            type="submit"
            className="authPrimaryBtn"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="authLegal">
          By continuing, you agree to yourshop’s{" "}
          <Link to="/terms" className="authLink">
            Conditions of Use
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="authLink">
            Privacy Notice
          </Link>
          .
        </p>

        <div className="authDividerRow">
          <div className="authDividerLine" />
          <div className="authDividerText">New to yourshop?</div>
          <div className="authDividerLine" />
        </div>

        <Link
          to="/register"
          className="authSecondaryBtnLink"
          aria-label="Create your yourshop account"
        >
          Create your yourshop account
        </Link>
      </div>

      {/* footer */}
      <div className="authFooterLinks">
        <Link to="/terms">Conditions of Use</Link>
        <Link to="/privacy">Privacy Notice</Link>
        <Link to="/help">Help</Link>
      </div>
      <div className="authFooterCopy">© 2025 yourshop</div>
    </div>
  );
}

export default Login;
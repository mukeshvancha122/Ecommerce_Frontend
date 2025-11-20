import React, { useState } from "react";
import "./Login.css";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/AuthSlice";
import { useHistory } from "react-router-dom";

import { getUserToken } from "../../api/user/UserTokenService";
import { registerUser } from "../../api/user/UserRegisterService";

export default function Login() {
  const dispatch = useDispatch();
  const history = useHistory();

  // form state
  const [mode, setMode] = useState("signin"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register-only
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState(""); // yyyy-mm-dd

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  //
  // Common helper: persist tokens + user
  //
  const handleAuthSuccess = (data, emailFallback) => {
    // adjust these 3 lines if your backend is slightly different
    const accessToken = "dummy_jwt_token_1234567890";
    const refreshToken = data.refresh || data.refresh_token;
    const user =
      data.user || {
        email: data.email || emailFallback,
        name: fullName || undefined,
      };

    // Store for axios interceptor
    localStorage.setItem(
      "auth_v1",
      JSON.stringify({
        token: accessToken,
        refresh: refreshToken,
        user,
      })
    );
    console.log("Stored auth_v1 in localStorage:", {
      token: accessToken,
      refresh: refreshToken,
      user,
    });

    dispatch(
      setCredentials({
        token: accessToken,
        refreshToken,
        user,
      })
    );

    history.push("/");
  };

  //
  // SIGN IN
  //
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await getUserToken(email, password);
      handleAuthSuccess(data, email);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Incorrect email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  //
  // REGISTER
  //
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // 1) Create user
      await registerUser({
        email,
        password,
        re_password: confirmPassword,
        dob,
      });

      // 2) Immediately login to get tokens
      const tokenData = await getUserToken(email, password);
      handleAuthSuccess(tokenData, email);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //
  // helpers
  //
  const switchTo = (nextMode) => {
    setMode(nextMode);
    setErrorMsg("");
    setPassword("");
    setConfirmPassword("");
  };

  //
  // UI
  //
  return (
    <main className="authPage">
      <section className="authCardWrapper">
        {/* SIGN IN MODE */}
        {mode === "signin" && (
          <form className="authCard" onSubmit={handleSignIn}>
            <h1 className="authTitle">Sign-In</h1>

            <label className="authLabel" htmlFor="ap_email">
              Email
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_email"
                className="authInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <label className="authLabel" htmlFor="ap_password">
              Password
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_password"
                className="authInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="authBtnPrimary" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}

            <p className="helpLink" style={{ marginTop: "12px" }}>
              {/* later you can navigate to a dedicated "Forgot password" page */}
              <a href="#">Forgot password?</a>
            </p>

            <hr className="authDivider" />

            <button
              type="button"
              className="authBtnSecondary"
              onClick={() => switchTo("register")}
            >
              Create your account
            </button>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === "register" && (
          <form className="authCard" onSubmit={handleRegister}>
            <h1 className="authTitle">Create account</h1>

            <label className="authLabel" htmlFor="ap_name">
              Full name
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_name"
                className="authInput"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <label className="authLabel" htmlFor="ap_email_new">
              Email
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_email_new"
                className="authInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label className="authLabel" htmlFor="ap_dob">
              Date of birth
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_dob"
                className="authInput"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <label className="authLabel" htmlFor="ap_password_new">
              Password
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_password_new"
                className="authInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <label className="authLabel" htmlFor="ap_password_confirm">
              Re-enter password
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_password_confirm"
                className="authInput"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="authBtnPrimary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create your account"}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}

            <button
              type="button"
              className="switchEmailBtn"
              onClick={() => switchTo("signin")}
            >
              Already have an account? Sign in
            </button>

            <p className="legalText" style={{ marginTop: "16px" }}>
              By creating an account, you agree to our{" "}
              <a className="legalLink" href="#">
                Conditions of Use
              </a>{" "}
              and{" "}
              <a className="legalLink" href="#">
                Privacy Notice
              </a>
              .
            </p>
          </form>
        )}
      </section>

      <footer className="authFooterWrapper">
        <div className="footerLinks">
          <a href="#">Conditions of Use</a>
          <a href="#">Privacy Notice</a>
          <a href="#">Help</a>
        </div>
        <div className="footerCopy">
          © 1996-2025, MyStore Inc. or its affiliates
        </div>
      </footer>
    </main>
  );
}
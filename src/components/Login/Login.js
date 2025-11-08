import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import API from "../../axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/AuthSlice";
import { useHistory } from "react-router-dom"; // v5

export default function Login() {

  // shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const dispatch = useDispatch();
  const history = useHistory();

  // business account fields
  const [businessName, setBusinessName] = useState("");

  // otp fields
  const [otpCode, setOtpCode] = useState("");

  // ui flow
  // "email"     ask for email / phone
  // "signin"    existing account -> enter password
  // "create"    new user -> enter name + password (personal)
  // "otp"       verify OTP sent by backend
  // "done"      success
  // "business"  business account create form
  const [step, setStep] = useState("email");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  //
  // STEP 1 -> CHECK EMAIL
  //
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // backend should tell us if account already exists
      // e.g. { exists: true } OR { exists: false }
      const res = await API.post("/auth/check-email", { email: email.trim() });

      if (res.data?.exists) {
        // user already registered -> ask password
        setStep("signin");
      } else {
        // not registered -> go to create new personal account
        setStep("create");
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //
  // STEP 2 -> SIGN IN EXISTING
  //
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try
    {
      // backend should return { token, user }
      const res = await axios.post("/auth/login", { email: email.trim(), password });
      localStorage.setItem("authToken", res.data.token);
      alert("Signed in successfully!");
      
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      history.push("/");
      // window.location.href = "/home"
    }
    catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "Incorrect password. Please try again."
      );
    }
    finally {
      setLoading(false);
    }
  };

  //
  // STEP 3 -> CREATE ACCOUNT (PERSONAL)
  // We do NOT immediately log them in.
  // We:
  //   1. call /auth/register to start signup
  //   2. backend must send OTP to email/phone
  //   3. we move UI -> "otp"
  //
  const handleCreateAccountStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // backend should:
      //  - create temp user with {name,email,password}
      //  - send OTP
      //  - return { pendingUserId: "abc123" }
      const res = await API.post("/auth/register", {
         name: fullName.trim(), email: email.trim(), password, accountType: "personal",
       });
      // we'll need this ID to verify OTP
      setPendingUserId(res.data.pendingUserId);
      setStep("otp");
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Could not create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //
  // BUSINESS ACCOUNT -> same idea, but with businessName
  //
  const [pendingUserId, setPendingUserId] = useState(null);

  const handleCreateBusinessAccountStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await API.post("/auth/register", {
         name: fullName.trim(), email: email.trim(), password,
         businessName: businessName.trim(), accountType: "business",
       });

      setPendingUserId(res.data.pendingUserId);
      setStep("otp");
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Could not create business account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //
  // STEP 4 -> OTP VERIFY
  //
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // backend should:
      //   POST /auth/verify-otp { pendingUserId, otpCode }
      //   if OK respond { token, user }
      const res = await API.post("/auth/verify-otp", { pendingUserId, otpCode: otpCode.trim() });
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      setStep("done");
      localStorage.setItem("authToken", res.data.token);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "Invalid or expired OTP code."
      );
    } finally {
      setLoading(false);
    }
  };

  //
  // RESET TO EMAIL STEP
  //
  const handleUseDifferentEmail = () => {
    setStep("email");
    setPassword("");
    setFullName("");
    setBusinessName("");
    setOtpCode("");
    setPendingUserId(null);
    setErrorMsg("");
  };

  //
  // UI
  //
  return (
    <main className="authPage">
      {/* Logo */}
      {/* <div className="authLogo">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
          alt="Amazon"
        />
      </div> */}

      <section className="authCardWrapper">
        {/* STEP: EMAIL CHECK */}
        {step === "email" && (
          <form className="authCard" onSubmit={handleCheckEmail}>
            <h1 className="authTitle">Sign in or create account</h1>

            <label className="authLabel" htmlFor="ap_email">
              Enter mobile number or email
            </label>

            <div className="authInputWrapper">
              <input
                id="ap_email"
                className="authInput"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
              {email && (
                <button
                  type="button"
                  className="authClearBtn"
                  aria-label="Clear"
                  onClick={() => setEmail("")}
                >
                  ✕
                </button>
              )}
            </div>

            <button type="submit" className="authBtnPrimary" disabled={loading}>
              {loading ? "Please wait..." : "Continue"}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}

            <p className="legalText">
              By continuing, you agree to Amazon&apos;s{" "}
              <a className="legalLink" href="#">
                Conditions of Use
              </a>{" "}
              and{" "}
              <a className="legalLink" href="#">
                Privacy Notice
              </a>
              .
            </p>

            <p className="helpLink">
              <a href="#">Need help?</a>
            </p>

            {/* BUSINESS BOX */}
            <div className="businessBox">
              <div className="businessBox-heading">Buying for work?</div>

              {/* This button now switches the UI to business account create */}
              <button
                type="button"
                className="businessBox-cta businessBox-btnlink"
                onClick={() => {
                  setStep("business");
                  setErrorMsg("");
                }}
              >
                Create a free business account
              </button>
            </div>
          </form>
        )}

        {/* STEP: SIGNIN (PASSWORD) */}
        {step === "signin" && (
          <form className="authCard" onSubmit={handleSignIn}>
            <h1 className="authTitle">Sign-In</h1>

            <div className="authSubGreeting">Email: {email}</div>

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

            <button
              type="button"
              className="switchEmailBtn"
              onClick={handleUseDifferentEmail}
            >
              Use a different email
            </button>

            <p className="helpLink" style={{ marginTop: "20px" }}>
              <a href="#">Forgot password?</a>
            </p>
          </form>
        )}

        {/* STEP: CREATE PERSONAL ACCOUNT */}
        {step === "create" && (
          <form className="authCard" onSubmit={handleCreateAccountStart}>
            <h1 className="authTitle">Create account</h1>

            <div className="authSubGreeting">
              We couldn&apos;t find an account with <b>{email}</b>. Create one
              now and we&apos;ll send you an OTP to verify.
            </div>

            <label className="authLabel" htmlFor="ap_name">
              Your name
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_name"
                className="authInput"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <label className="authLabel" htmlFor="ap_email_new">
              Email
            </label>
            <div className="authInputWrapper">
              <input
                id="ap_email_new"
                className="authInput"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
              onClick={handleUseDifferentEmail}
            >
              Use a different email
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

        {/* STEP: CREATE BUSINESS ACCOUNT */}
        {step === "business" && (
          <form className="authCard" onSubmit={handleCreateBusinessAccountStart}>
            <h1 className="authTitle">Create a free business account</h1>

            <div className="authSubGreeting">
              Use your work email. We&apos;ll verify with an OTP.
            </div>

            <label className="authLabel" htmlFor="biz_name">
              Business name
            </label>
            <div className="authInputWrapper">
              <input
                id="biz_name"
                className="authInput"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            <label className="authLabel" htmlFor="biz_contact_name">
              Your name
            </label>
            <div className="authInputWrapper">
              <input
                id="biz_contact_name"
                className="authInput"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <label className="authLabel" htmlFor="biz_email">
              Work email
            </label>
            <div className="authInputWrapper">
              <input
                id="biz_email"
                className="authInput"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label className="authLabel" htmlFor="biz_password">
              Password
            </label>
            <div className="authInputWrapper">
              <input
                id="biz_password"
                className="authInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="authBtnPrimary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create business account"}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}

            <button
              type="button"
              className="switchEmailBtn"
              onClick={handleUseDifferentEmail}
            >
              Use a different email
            </button>

            <p className="legalText" style={{ marginTop: "16px" }}>
              By continuing you agree to our{" "}
              <a className="legalLink" href="#">
                Business Terms
              </a>{" "}
              and{" "}
              <a className="legalLink" href="#">
                Privacy Notice
              </a>
              .
            </p>
          </form>
        )}

        {/* STEP: OTP VERIFY */}
        {step === "otp" && (
          <form className="authCard" onSubmit={handleVerifyOtp}>
            <h1 className="authTitle">Verify OTP</h1>

            <div className="authSubGreeting">
              We sent a code to <b>{email}</b>. Enter it below to finish
              creating your account.
            </div>

            <label className="authLabel" htmlFor="otp_code">
              Enter OTP
            </label>
            <div className="authInputWrapper">
              <input
                id="otp_code"
                className="authInput"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="authBtnPrimary" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}

            <p className="noteText">
              Didn&apos;t get it? Check spam or{" "}
              <button
                type="button"
                className="switchEmailBtn"
                onClick={async () => {
                  // OPTIONAL: you can call backend to resend OTP
                  // await axios.post("/auth/resend-otp", { pendingUserId });
                  alert("If this was real, we'd resend the OTP now.");
                }}
              >
                resend code
              </button>
            </p>

            <button
              type="button"
              className="switchEmailBtn"
              onClick={handleUseDifferentEmail}
              style={{ marginTop: "16px" }}
            >
              Use a different email
            </button>
          </form>
        )}

        {/* STEP: DONE */}
        {step === "done" && (
          <div className="authCard">
            <h1 className="authTitle">Success 🎉</h1>
            <div className="authSubGreeting">
              Your account is verified and you are now signed in.
            </div>

            <button
              type="button"
              className="authBtnPrimary"
              onClick={() => {
                // go somewhere after success
                // window.location.href = "/home"
                alert("Go to dashboard");
              }}
            >
              Continue
            </button>
          </div>
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
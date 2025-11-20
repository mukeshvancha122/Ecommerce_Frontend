import React, { useState } from "react";
import "./Login.css";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { setCredentials } from "../../features/auth/AuthSlice";

// auth services
import { getUserToken } from "../../api/user/UserTokenService";
import { registerUser } from "../../api/user/UserRegisterService";

// password / forgot-password services
import { sendPasswordResetEmail } from "../../api/user/UserPasswordResetEmailService";
import { verifyPasswordResetOTP } from "../../api/user/UserPasswordResetVerifyService";
import { resetPassword } from "../../api/user/UserResetPasswordService";

export default function Login() {
  const dispatch = useDispatch();
  const history = useHistory();

  /**
   * UI modes:
   *  - "signin"       → normal login
   *  - "register"     → create account
   *  - "forgotEmail"  → enter email to send OTP
   *  - "forgotOtp"    → verify OTP
   *  - "forgotReset"  → set new password
   */
  const [mode, setMode] = useState("signin");

  // shared / auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register-only
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState(""); // yyyy-mm-dd

  // forgot-password flow
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // ----------------------------------------------------
  // Helper: after successful login (from sign-in or auto-login after register)
  // ----------------------------------------------------
  const handleAuthSuccess = (data) => {
    // Flexible: works with dummy + real API
    const accessToken = data.access || data.token;
    const refreshToken = data.refresh || null;

    const user =
      data.user ||
      {
        email: data.email || email,
        name: fullName || undefined,
      };

    // This matches your axios interceptor (auth_v1.token / auth_v1.refresh)
    localStorage.setItem(
      "auth_v1",
      JSON.stringify({
        token: accessToken,
        refresh: refreshToken,
        user,
      })
    );

    dispatch(
      setCredentials({
        token: accessToken,
        refreshToken,
        user,
      })
    );

    history.push("/"); // send to home / dashboard
  };

  const resetMessages = () => {
    setErrorMsg("");
    setInfoMsg("");
  };

  // ----------------------------------------------------
  // SIGN IN
  // ----------------------------------------------------
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const data = await getUserToken(email, password);
      handleAuthSuccess(data);
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

  // ----------------------------------------------------
  // REGISTER
  // ----------------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // 1) create account
      await registerUser({
        email,
        password,
        re_password: confirmPassword,
        dob,
      });

      setInfoMsg("Account created. Logging you in…");

      // 2) auto-login to get tokens
      const tokenData = await getUserToken(email, password);
      handleAuthSuccess(tokenData);
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

  // ----------------------------------------------------
  // FORGOT PASSWORD FLOW
  // 1) enter email  → send OTP
  // 2) enter OTP    → verify
  // 3) new password → reset
  // ----------------------------------------------------

  // step 1: send email
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      await sendPasswordResetEmail(email);
      setInfoMsg(
        "If this email exists, an OTP has been sent. Please check your inbox."
      );
      setMode("forgotOtp");
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not send reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  // step 2: verify otp
  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      await verifyPasswordResetOTP(email, otpCode);
      setInfoMsg("OTP verified. Please set your new password.");
      setMode("forgotReset");
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // step 3: reset password
  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    if (newPassword !== newPasswordAgain) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(newPassword, newPasswordAgain);
      setInfoMsg("Password reset successful. Please sign in with your new password.");
      // clear sensitive fields
      setPassword("");
      setNewPassword("");
      setNewPasswordAgain("");
      setOtpCode("");
      // go back to sign in
      setMode("signin");
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Mode switch helpers
  // ----------------------------------------------------
  const switchToSignIn = () => {
    resetMessages();
    setMode("signin");
    setPassword("");
  };

  const switchToRegister = () => {
    resetMessages();
    setMode("register");
  };

  const switchToForgotEmail = () => {
    resetMessages();
    setMode("forgotEmail");
    setOtpCode("");
    setNewPassword("");
    setNewPasswordAgain("");
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <main className="authPage">
      <section className="authCardWrapper">
        {/* SIGN-IN */}
        {mode === "signin" && (
          <form className="authCard" onSubmit={handleSignIn}>
            <h1 className="authTitle">Sign-In</h1>

            <label className="authLabel" htmlFor="login_email">
              Email
            </label>
            <div className="authInputWrapper">
              <input
                id="login_email"
                className="authInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <label className="authLabel" htmlFor="login_password">
              Password
            </label>
            <div className="authInputWrapper">
              <input
                id="login_password"
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
            {infoMsg && <div className="infoText">{infoMsg}</div>}

            <p className="helpLink" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="switchEmailBtn"
                onClick={switchToForgotEmail}
              >
                Forgot password?
              </button>
            </p>

            <hr className="authDivider" />

            <button
              type="button"
              className="authBtnSecondary"
              onClick={switchToRegister}
            >
              Create your account
            </button>
          </form>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <form className="authCard" onSubmit={handleRegister}>
            <h1 className="authTitle">Create account</h1>

            <label className="authLabel" htmlFor="reg_name">
              Full name
            </label>
            <div className="authInputWrapper">
              <input
                id="reg_name"
                className="authInput"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <label className="authLabel" htmlFor="reg_email">
              Email
            </label>
            <div className="authInputWrapper">
              <input
                id="reg_email"
                className="authInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label className="authLabel" htmlFor="reg_dob">
              Date of birth
            </label>
            <div className="authInputWrapper">
              <input
                id="reg_dob"
                className="authInput"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <label className="authLabel" htmlFor="reg_password">
              Password
            </label>
            <div className="authInputWrapper">
              <input
                id="reg_password"
                className="authInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <label className="authLabel" htmlFor="reg_password_confirm">
              Re-enter password
            </label>
            <div className="authInputWrapper">
              <input
                id="reg_password_confirm"
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
            {infoMsg && <div className="infoText">{infoMsg}</div>}

            <button
              type="button"
              className="switchEmailBtn"
              onClick={switchToSignIn}
              style={{ marginTop: "16px" }}
            >
              Already have an account? Sign in
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD – STEP 1: EMAIL */}
        {mode === "forgotEmail" && (
          <form className="authCard" onSubmit={handleForgotEmailSubmit}>
            <h1 className="authTitle">Password assistance</h1>

            <div className="authSubGreeting">
              Enter the email address associated with your account.
            </div>

            <label className="authLabel" htmlFor="forgot_email">
              Email
            </label>
            <div className="authInputWrapper">
              <input
                id="forgot_email"
                className="authInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="authBtnPrimary" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}
            {infoMsg && <div className="infoText">{infoMsg}</div>}

            <button
              type="button"
              className="switchEmailBtn"
              onClick={switchToSignIn}
              style={{ marginTop: "16px" }}
            >
              Back to sign in
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD – STEP 2: OTP */}
        {mode === "forgotOtp" && (
          <form className="authCard" onSubmit={handleForgotOtpSubmit}>
            <h1 className="authTitle">Verify OTP</h1>

            <div className="authSubGreeting">
              We sent a code to <b>{email}</b>. Enter it below.
            </div>

            <label className="authLabel" htmlFor="forgot_otp">
              OTP code
            </label>
            <div className="authInputWrapper">
              <input
                id="forgot_otp"
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
            {infoMsg && <div className="infoText">{infoMsg}</div>}

            <button
              type="button"
              className="switchEmailBtn"
              onClick={switchToForgotEmail}
              style={{ marginTop: "16px" }}
            >
              Change email
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD – STEP 3: RESET */}
        {mode === "forgotReset" && (
          <form className="authCard" onSubmit={handleForgotResetSubmit}>
            <h1 className="authTitle">Reset your password</h1>

            <div className="authSubGreeting">
              Set a new password for <b>{email}</b>.
            </div>

            <label className="authLabel" htmlFor="forgot_new_password">
              New password
            </label>
            <div className="authInputWrapper">
              <input
                id="forgot_new_password"
                className="authInput"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <label className="authLabel" htmlFor="forgot_new_password_again">
              Re-enter new password
            </label>
            <div className="authInputWrapper">
              <input
                id="forgot_new_password_again"
                className="authInput"
                type="password"
                value={newPasswordAgain}
                onChange={(e) => setNewPasswordAgain(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="authBtnPrimary" disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}
            {infoMsg && <div className="infoText">{infoMsg}</div>}

            <button
              type="button"
              className="switchEmailBtn"
              onClick={switchToSignIn}
              style={{ marginTop: "16px" }}
            >
              Back to sign in
            </button>
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

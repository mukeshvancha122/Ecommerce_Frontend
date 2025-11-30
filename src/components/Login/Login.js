import React, { useState } from "react";
import "./Login.css";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { store } from "../../store";

import { setCredentials } from "../../features/auth/AuthSlice";
import { useTranslation } from "../../i18n/TranslationProvider";

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
  const location = useLocation();
  const { t } = useTranslation();
  
  // Get the intended destination from location state (set by ProtectedRoute)
  const from = location.state?.from || "/";

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

  const handleAuthSuccess = (data) => {
    // Flexible: works with dummy + real API
    const accessToken = data.access || data.token;
    const refreshToken = data.refresh || null;

    if (!accessToken) {
      console.error("No access token received:", data);
      setErrorMsg("Authentication failed: No token received.");
      return;
    }

    // Ensure we have a valid user object with at least an email
    const userEmail = data.email || data.user?.email || email;
    if (!userEmail) {
      console.error("No email found in login response:", data);
      setErrorMsg("Authentication failed: No user email received.");
      return;
    }

    const user = data.user || {
      email: userEmail,
      name: data.user?.name || data.name || fullName || undefined,
      id: data.user?.id || data.id || null,
    };

    // Ensure user object has email (required for recognition)
    if (!user.email) {
      user.email = userEmail;
    }

    console.log("Storing auth data:", { 
      token: accessToken ? "present" : "missing", 
      user: { email: user.email, name: user.name, id: user.id },
      hasUser: !!user 
    });

    // This matches your axios interceptor (auth_v1.token / auth_v1.refresh)
    localStorage.setItem(
      "auth_v1",
      JSON.stringify({
        token: accessToken,
        refresh: refreshToken,
        user,
      })
    );

    // Verify what was stored
    const stored = JSON.parse(localStorage.getItem("auth_v1"));
    console.log("Verified stored auth:", { 
      hasToken: !!stored?.token, 
      hasUser: !!stored?.user,
      userEmail: stored?.user?.email 
    });

    dispatch(
      setCredentials({
        token: accessToken,
        refreshToken,
        user,
      })
    );

    // Verify Redux state after dispatch
    setTimeout(() => {
      const state = store.getState();
      console.log("Redux auth state after login:", {
        hasUser: !!state.auth.user,
        userEmail: state.auth.user?.email,
        hasToken: !!state.auth.token
      });
    }, 100);

    // Redirect to the intended page (from ProtectedRoute) or home
    history.push(from);
  };

  const resetMessages = () => {
    setErrorMsg("");
    setInfoMsg("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    // Validation
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const data = await getUserToken(email, password);
      
      console.log("Login response from getUserToken:", data);
      console.log("Token check:", {
        hasAccess: !!data.access,
        hasToken: !!data.token,
        accessValue: data.access ? data.access.substring(0, 20) + "..." : "MISSING"
      });
      
      // Ensure we have a valid token
      if (!data.access && !data.token) {
        console.error("Token validation failed:", data);
        throw new Error("No authentication token received. Please try again.");
      }
      
      handleAuthSuccess(data);
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different error response formats
      const errorData = err?.response?.data;
      let errorMessage = "";
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData) && errorData.length > 0) {
        errorMessage = errorData[0];
      } else {
        errorMessage = err?.message || "Incorrect email or password. Please try again.";
      }
      
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    // Validation
    if (!email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // 1) create account
      const response = await registerUser({
        email,
        password,
        re_password: confirmPassword,
        dob: dob || null, // Make dob optional
      });

      console.log("Registration successful:", response);

      // 2) Show success message and redirect to login
      setInfoMsg("Account created successfully! Redirecting to login...");
      
      // Clear all form fields for security
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setDob("");
      
      // Switch to sign-in mode after a short delay
      setTimeout(() => {
        setMode("signin");
        setInfoMsg("Please log in with your email and password.");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      
      // Check if email is already registered
      const errorData = err?.response?.data;
      let errorMessage = "";
      
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.email && Array.isArray(errorData.email)) {
        errorMessage = errorData.email[0];
      } else if (errorData?.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        errorMessage = errorData.non_field_errors[0];
      } else {
        errorMessage = err?.message || "Could not create account. Please try again.";
      }
      
      const isEmailExists = 
        errorMessage.toLowerCase().includes("already") ||
        errorMessage.toLowerCase().includes("exists") ||
        errorMessage.toLowerCase().includes("registered") ||
        errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("taken") ||
        err?.response?.status === 400 && (
          errorMessage.toLowerCase().includes("email") || 
          errorData?.email
        );

      if (isEmailExists) {
        setErrorMsg("This email is already registered. Please log in instead.");
        // Clear password fields
        setPassword("");
        setConfirmPassword("");
        // Switch to login mode after a short delay
        setTimeout(() => {
          setMode("signin");
          setErrorMsg("");
          setInfoMsg("Please log in with your email and password.");
        }, 2000);
      } else {
        setErrorMsg(errorMessage);
      }
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
  
  return (
    <main className="authPage">
      <section className="authCardWrapper">
        {/* SIGN-IN */}
        {mode === "signin" && (
          <form className="authCard" onSubmit={handleSignIn}>
            <h1 className="authTitle">{t("auth.signIn")}</h1>

            <label className="authLabel" htmlFor="login_email">
              {t("auth.email")}
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
              {t("auth.password")}
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
              {loading ? "…" : t("auth.signInCta")}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}
            {infoMsg && <div className="infoText">{infoMsg}</div>}

            <p className="helpLink" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="switchEmailBtn"
                onClick={switchToForgotEmail}
              >
                {t("auth.forgotPassword")}
              </button>
            </p>

            <hr className="authDivider" />

            <button
              type="button"
              className="authBtnSecondary"
              onClick={switchToRegister}
            >
              {t("auth.createAccount")}
            </button>
          </form>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <form className="authCard" onSubmit={handleRegister}>
            <h1 className="authTitle">{t("auth.createAccount")}</h1>

            <label className="authLabel" htmlFor="reg_name">
              {t("auth.fullName")}
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
              {t("auth.email")}
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
              {t("auth.dob")} <span style={{ color: "#666", fontSize: "0.9em" }}>(Optional)</span>
            </label>
            <div className="authInputWrapper">
              <input
                id="reg_dob"
                className="authInput"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <label className="authLabel" htmlFor="reg_password">
              {t("auth.password")}
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
              {t("auth.confirmPassword")}
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
              {loading ? "…" : t("auth.createAccountCta")}
            </button>

            {errorMsg && <div className="errorText">{errorMsg}</div>}
            {infoMsg && <div className="infoText">{infoMsg}</div>}

            <button
              type="button"
              className="switchEmailBtn"
              onClick={switchToSignIn}
              style={{ marginTop: "16px" }}
            >
              Already have an account? {t("auth.signInCta")}
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
        <div className="footerCopy">{t("auth.footerCopy")}</div>
      </footer>
    </main>
  );
}

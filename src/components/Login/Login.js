import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      if (response?.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      if (response?.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      history.push("/");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Login failed. Please check your email/password."
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post("/api/auth/register", {
        email,
        password,
      });

      if (response?.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      if (response?.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      history.push("/"); 
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Registration failed. Please try again with a different email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <Link to="/">
        <img
          className="login-logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png"
          alt="Logo"
        />
      </Link>

      <div className="login-container">
        <h1>Sign in</h1>

        <form>
          <h5>Email</h5>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
          />

          <h5>Password</h5>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />

          <button
            type="submit"
            onClick={signIn}
            className="login-signInButton"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p>
          By signing in, you agree to our Conditions of Use & Sale. Please see
          our Privacy Notice, Cookies Notice, and Interest-Based Ads Notice.
        </p>

        <button
          onClick={register}
          className="login-registerButton"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create your Account"}
        </button>
      </div>
    </div>
  );
}

export default Login;

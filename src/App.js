import React from "react";
import "./App.css";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import SubHeader from "./components/Header/subheader/SubHeader";
import Home from "./components/Home/Home";
import Checkout from "./components/Checkout/Checkout";
import Login from "./components/Login/Login";
import Payment from "./components/Payment/Payment";
import OrdersPage from "./pages/OrdersPage/OrdersPage";
import ChatWidget from "./components/chatWidget/ChatWidget";
import ProductPage from "./pages/ProductPage/ProductPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import ProtectedRoute from "./routing/ProtectedRoute";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Redux auth 
import { useSelector } from "react-redux";
import { selectUser } from "./features/auth/AuthSlice"; 

const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

export default function App() {
  // user is hydrated from localStorage in index.js via hydrateFromStorage()
  const user = useSelector(selectUser);

  return (
    <Router>
      <div className="app">
        <Switch>
          <Route path="/orders">
            <Header />
            <SubHeader />
            <OrdersPage />
          </Route>

          <Route path="/login">
            <Login />
          </Route>

          <Route path="/checkout">
            <Header />
            <SubHeader />
            <Checkout />
          </Route>

          <Route path="/payment">
            <Header />
            <SubHeader />
            <Elements stripe={stripePromise}>
              <Payment />
            </Elements>
          </Route>

          <Route path="/product/:slug">
            <Header />
            <SubHeader />
            <ProductPage />
          </Route>

          <Route path="/proceed-to-checkout">
            {/* <ProtectedRoute path="/secure-checkout"> */}
              <Header />
              <SubHeader />
              <CheckoutPage />
          </Route>
         
          <Route path="/">
            <Header />
            <SubHeader />
            <Home />
          </Route>
        </Switch>

        <ChatWidget user={user} />
      </div>
    </Router>
  );
}

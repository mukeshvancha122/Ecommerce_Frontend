import React from "react";
import "./App.css";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

import Header from "./components/Header/Header";
import SubHeader from "./components/Header/subheader/SubHeader";
import Home from "./components/Home/Home";
import Checkout from "./components/Checkout/Checkout";
import Login from "./components/Login/Login";
import Payment from "./components/Payment/Payment";
import OrdersPage from "./pages/OrdersPage/OrdersPage";
import ChatWidget from "./components/chatwidget/ChatWidget";
import ProductPage from "./pages/ProductPage/ProductPage";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import AccountPage from "./pages/AccountPage/AccountPage";
import CustomerServicePage from "./pages/CustomerServicePage/CustomerServicePage";
import ProtectedRoute from "./routing/ProtectedRoute";
import SearchResultPage from "./pages/SearchResultPage/SearchResultPage";
import SearchResults from "./pages/SearchPage/SearchResultsPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage/OrderConfirmationPage";
import { TranslationProvider } from "./i18n/TranslationProvider";
import { CartProvider } from "./contexts/CartContext";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { useSelector } from "react-redux";
import { selectUser } from "./features/auth/AuthSlice";

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx"
);

export default function App() {
  const user = useSelector(selectUser);

  return (
    <ErrorBoundary>
      <TranslationProvider>
        <CartProvider>
          <Router>
            <div className="app">
            <Switch>
            {/* Protected Routes - Require Login */}
            <ProtectedRoute path="/orders">
              <Header />
              <SubHeader />
              <OrdersPage />
            </ProtectedRoute>

            <ProtectedRoute path="/account">
              <Header />
              <SubHeader />
              <AccountPage />
            </ProtectedRoute>

            {/* Checkout route is public - allows guests to view cart */}
            <Route path="/checkout">
              <Header />
              <SubHeader />
              <Checkout />
            </Route>

            <ProtectedRoute path="/payment">
              <Header />
              <SubHeader />
              <Elements stripe={stripePromise}>
                <Payment />
              </Elements>
            </ProtectedRoute>

            <ProtectedRoute path="/proceed-to-checkout">
              <Header />
              <SubHeader />
              <Elements stripe={stripePromise}>
                <CheckoutPage />
              </Elements>
            </ProtectedRoute>

            <ProtectedRoute path="/order-confirmation">
              <Header />
              <SubHeader />
              <Elements stripe={stripePromise}>
                <OrderConfirmationPage />
              </Elements>
            </ProtectedRoute>

            {/* Public Routes - No Login Required */}
            <Route path="/login">
              <Login />
            </Route>

            <Route path="/search">
              <Header />
              <SubHeader />
              <SearchResults />
            </Route>

            <Route path="/product/:slug">
              <Header />
              <SubHeader />
              <ProductPage />
            </Route>

            <Route path="/products">
              <Header />
              <SubHeader />
              <ProductsPage />
            </Route>

            <Route path="/search-results">
              <Header />
              <SubHeader />
              <SearchResultPage />
            </Route>

            <Route path="/help">
              <Header />
              <SubHeader />
              <CustomerServicePage />
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
        </CartProvider>
      </TranslationProvider>
    </ErrorBoundary>
  );
}

import React from "react";
import "./AccountDropdown.css";

function AccountDropdown({ isOpen, onClose, user }) {

  if (!isOpen) return null;

  const isSignedIn = !!user; 

  return (
    <div className="acctDrop-overlay" onClick={onClose}>
      {/* stop click from bubbling so inside clicks don't close */}
      <div
        className="acctDrop-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* little arrow / notch on top */}
        <div className="acctDrop-notch" />

        {/* TOP SIGN-IN BLOCK (for guests) */}
        {!isSignedIn && (
          <div className="acctDrop-topBlock">
            <button className="acctDrop-signInBtn">
              Sign in
            </button>
            <div className="acctDrop-newCustomer">
              New customer?{" "}
              <a className="acctDrop-startHere" href="/register">
                Start here.
              </a>
            </div>
          </div>
        )}

        {isSignedIn && (
          <div className="acctDrop-topBlock">
            <div className="acctDrop-welcomeText">
              Signed in as <strong>{user.name || user.email}</strong>
            </div>
            <button className="acctDrop-signInBtn acctDrop-manageBtn">
              Manage Account
            </button>
          </div>
        )}

        <div className="acctDrop-divider" />

        {/* TWO-COLUMN LINKS */}
        <div className="acctDrop-columns">
          <div className="acctDrop-col">
            <div className="acctDrop-colHeader">Your Lists</div>
            <a className="acctDrop-link" href="/lists/create">
              Create a List
            </a>
            <a className="acctDrop-link" href="/lists/find">
              Find a List or Registry
            </a>
          </div>

          <div className="acctDrop-col acctDrop-colRight">
            <div className="acctDrop-colHeader">Your Account</div>

            <a className="acctDrop-link" href="/account">Account</a>
            <a className="acctDrop-link" href="/orders">Orders</a>
            <a className="acctDrop-link" href="/keep-shopping">
              Keep Shopping For
            </a>
            <a className="acctDrop-link" href="/recommendations">
              Recommendations
            </a>
            <a className="acctDrop-link" href="/history">
              Browsing History
            </a>
            <a className="acctDrop-link" href="/preferences">
              Your Shopping preferences
            </a>
            <a className="acctDrop-link" href="/payments/credit">
              Store Credit / Cards
            </a>
            <a className="acctDrop-link" href="/watchlist">
              Watchlist
            </a>
            <a className="acctDrop-link" href="/purchases">
              Video Purchases &amp; Rentals
            </a>
            <a className="acctDrop-link" href="/subscriptions/reading">
              Reading / Subscriptions
            </a>
            <a className="acctDrop-link" href="/devices">
              Content &amp; Devices
            </a>
            <a className="acctDrop-link" href="/subscribe-save">
              Subscribe &amp; Save Items
            </a>
            <a className="acctDrop-link" href="/memberships">
              Memberships &amp; Subscriptions
            </a>
            <a className="acctDrop-link" href="/business/register">
              Register for a Business Account
            </a>
            <a className="acctDrop-link" href="/sell">
              Start a Selling Account
            </a>
            <a className="acctDrop-link" href="/help">
              Customer Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDropdown;
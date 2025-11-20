import React, { useEffect, useState } from "react";
import "./AccountPage.css";
import { fetchProfileSummary } from "../../api/user/ProfileService";
import { useTranslation } from "../../i18n/TranslationProvider";

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function AccountPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProfileSummary()
      .then(({ data }) => {
        if (mounted) {
          setProfile(data);
          setError("");
        }
      })
      .catch(() => mounted && setError("Unable to load your profile right now."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="accountPage accountPage--loading">
        <div className="ap-loader" aria-live="polite">
          Preparing your HyderNexa profile…
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="accountPage accountPage--loading">
        <div className="ap-error">{error}</div>
      </main>
    );
  }

  const stats = profile.stats || {
    loyalty: "HyderNexa Prime",
    ordersYtd: 24,
    returns: 1,
    credits: "₹3,250",
    perksProgress: 62,
  };

  const timeline = profile.security.activity || [
    {
      id: "evt1",
      label: "Password updated",
      description: "You changed your password",
      at: "2025-01-04T10:00:00.000Z",
    },
    {
      id: "evt2",
      label: "New device sign-in",
      description: "MacBook Pro · Hyderabad, India",
      at: "2025-02-13T07:20:00.000Z",
    },
    {
      id: "evt3",
      label: "Two-factor challenge",
      description: "Code sent to primary mobile",
      at: "2025-02-15T08:12:00.000Z",
    },
  ];

  return (
    <main className="accountPage">
      <section className="ap-hero">
        <div>
          <p className="ap-kicker">{t("brand")}</p>
          <h1>Account Center</h1>
          <p className="ap-subtitle">
            Manage login & security, preferences, saved addresses, and payment profiles from a single screen.
          </p>
        </div>
        <div className="ap-heroCard">
          <p className="ap-heroLabel">Signed in as</p>
          <h2>{profile.name}</h2>
          <p className="ap-heroEmail">{profile.email}</p>
          <p className="ap-heroStatus">Last login · {formatDate(profile.security.lastLogin)}</p>
        </div>
      </section>

      <section className="ap-quickActions">
        <div className="ap-stat">
          <div className="ap-statLabel">Orders this year</div>
          <div className="ap-statValue">{stats.ordersYtd}</div>
          <p className="ap-statMeta">+8% vs last year</p>
        </div>
        <div className="ap-stat">
          <div className="ap-statLabel">HyderNexa credit</div>
          <div className="ap-statValue">{stats.credits}</div>
          <p className="ap-statMeta">Available to spend</p>
        </div>
        <div className="ap-stat">
          <div className="ap-statLabel">Returns this year</div>
          <div className="ap-statValue">{stats.returns}</div>
          <p className="ap-statMeta">Keep return rate low</p>
        </div>
        <div className="ap-statProgress">
          <div className="ap-statLabel">Prime loyalty</div>
          <div className="ap-tier">{stats.loyalty}</div>
          <div className="ap-progressBar">
            <div style={{ width: `${stats.perksProgress}%` }} />
          </div>
          <p className="ap-statMeta">{stats.perksProgress}% towards next perk</p>
        </div>
      </section>

      <section className="ap-grid">
        <article className="ap-card">
          <header className="ap-cardHeader">
            <div>
              <h3>Login & Security</h3>
              <p>Keep your personal info up-to-date</p>
            </div>
            <button type="button" className="ap-secondary">Manage</button>
          </header>
          <div className="ap-row">
            <div>
              <p className="ap-label">Name</p>
              <p className="ap-value">{profile.name}</p>
            </div>
            <button className="ap-pill">Edit</button>
          </div>
          <div className="ap-row">
            <div>
              <p className="ap-label">Email</p>
              <p className="ap-value">{profile.email}</p>
            </div>
            <button className="ap-pill">Edit</button>
          </div>
          <div className="ap-row">
            <div>
              <p className="ap-label">Primary mobile number</p>
              <p className="ap-value">{profile.primaryPhone}</p>
              <p className="ap-description">
                Quickly sign-in, recover passwords, and receive security notifications.
              </p>
            </div>
            <button className="ap-pill">Edit</button>
          </div>
          <div className="ap-row">
            <div>
              <p className="ap-label">Passkey</p>
              <p className="ap-value">
                {profile.passkeyEnabled ? "Enabled on your devices" : "Not set up"}
              </p>
              <p className="ap-description">
                Sign in using your face, fingerprint, or device PIN. No passwords required.
              </p>
            </div>
            <button className="ap-pill">{profile.passkeyEnabled ? "Manage" : "Set up"}</button>
          </div>
          <div className="ap-row">
            <div>
              <p className="ap-label">Password</p>
              <p className="ap-value">********</p>
              <p className="ap-description">
                Last changed on {formatDate(profile.passwordLastChanged)}
              </p>
            </div>
            <button className="ap-pill">Edit</button>
          </div>
        </article>

        <article className="ap-card">
          <header className="ap-cardHeader">
            <div>
              <h3>Preferences</h3>
              <p>Language, country, and currency</p>
            </div>
            <button type="button" className="ap-secondary">Update</button>
          </header>
          <div className="ap-row ap-row--compact">
            <p className="ap-label">Language</p>
            <p className="ap-value">{profile.preferences.language}</p>
          </div>
          <div className="ap-row ap-row--compact">
            <p className="ap-label">Country/Region</p>
            <p className="ap-value">{profile.preferences.country}</p>
          </div>
          <div className="ap-row ap-row--compact">
            <p className="ap-label">Currency</p>
            <p className="ap-value">{profile.preferences.currency}</p>
          </div>
        </article>

        <article className="ap-card">
          <header className="ap-cardHeader">
            <div>
              <h3>Saved addresses</h3>
              <p>Deliver faster by keeping addresses current</p>
            </div>
            <button type="button" className="ap-secondary">Add address</button>
          </header>
          <div className="ap-addressList">
            {profile.addresses.map((addr) => (
              <div key={addr.id} className="ap-address">
                <p className="ap-addressLabel">{addr.label}</p>
                <p>{addr.line1}</p>
                <p>{addr.line2}</p>
                <p>
                  {addr.city}, {addr.state} {addr.zip}
                </p>
                <p>{addr.country}</p>
                <p className="ap-addressPhone">{addr.phone}</p>
                <button className="ap-pill ap-pill--outline">Edit</button>
              </div>
            ))}
          </div>
        </article>

        <article className="ap-card">
          <header className="ap-cardHeader">
            <div>
              <h3>Payment methods</h3>
              <p>Cards saved for checkout</p>
            </div>
            <button type="button" className="ap-secondary">Manage cards</button>
          </header>
          <ul className="ap-paymentList">
            {profile.payments.map((card) => (
              <li key={card.id}>
                <div>
                  <p className="ap-label">{card.brand}</p>
                  <p className="ap-value">•••• •••• •••• {card.last4}</p>
                </div>
                <span className="ap-badge">{card.exp}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="ap-card">
          <header className="ap-cardHeader">
            <div>
              <h3>Trusted devices</h3>
              <p>Devices that recently signed in</p>
            </div>
            <button type="button" className="ap-secondary">Review activity</button>
          </header>
          <ul className="ap-deviceList">
            {profile.security.devices.map((device) => (
              <li key={device.id}>
                <div>
                  <p className="ap-label">{device.label}</p>
                  <p className="ap-value">{device.location}</p>
                </div>
                <span className="ap-description">Last used {formatDate(device.lastUsed)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="ap-card ap-card--stretch">
          <header className="ap-cardHeader">
            <div>
              <h3>Security activity</h3>
              <p>Recent login and verification events</p>
            </div>
            <button type="button" className="ap-secondary">Open Security Center</button>
          </header>
          <ul className="ap-activityTimeline">
            {timeline.map((event) => (
              <li key={event.id}>
                <div className="ap-activityDot" />
                <div>
                  <p className="ap-value">{event.label}</p>
                  <p className="ap-description">{event.description}</p>
                </div>
                <span className="ap-description">{formatDate(event.at)}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}


import { motion } from "motion/react";
import { getPeopleTotals, getTabTotal, getClaimedTotal, getUnclaimedTotal } from "../utils/compute.js";
import { toggleItemClaim } from "../services/tabs.js";
import {
  Button,
  Card,
  Money,
  ProgressRing,
  AvatarStack,
} from "../index.js";
import TabQRCode from "./TabQRCode.jsx";
import "../styles/Summary.css";
import { useState } from "react";

export default function Summary({
  tab,
  guestName,
  onBackToGuest,
  onSettle,
}) {
  const [settling, setSettling] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const totals = getPeopleTotals(tab.items);
  const tabTotal = getTabTotal(tab.items);
  const claimedTotal = getClaimedTotal(tab.items);
  const unclaimedTotal = getUnclaimedTotal(tab.items);
  const isHost = guestName === "" || guestName === tab.hostName;
  const userTotal = totals.find((t) => t.name === guestName)?.amount ?? 0;

  async function handleSettle() {
    try {
      setSettling(true);
      await onSettle();
    } finally {
      setSettling(false);
    }
  }

  async function handleHostToggleClaim(item) {
    if (tab.status === "settled" || updatingItemId) return;

    const alreadyClaimed = item.claimedBy.includes(tab.hostName);

    try {
      setUpdatingItemId(item.id);
      await toggleItemClaim(tab.id, item.id, tab.hostName, alreadyClaimed);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingItemId(null);
    }
  }

  function generateVenmoLink(name, amount) {
    return `https://venmo.com/?txn=pay&audience=private&recipients=${encodeURIComponent(name)}&amount=${amount.toFixed(2)}&note=Payment for ${encodeURIComponent(tab.tabName)}`;
  }

  return (
    <div className="summary-screen-premium">
      {/* Header */}
      <div className="summary-hero">
        <div>
          <span className="eyebrow">
            {tab.status === "settled" ? "✓ All split" : "Almost done"}
          </span>
          <h1>{tab.tabName}</h1>
          <p>Hosted by {tab.hostName}</p>
        </div>

        {tab.status === "settled" && (
          <div className="settled-badge">
            <span>✓</span>
            All settled
          </div>
        )}
      </div>

      {/* Share / QR */}
      {tab.status === "open" && (
        <Card elevated className="share-card">
          <div className="share-card-content">
            <div className="share-copy">
              <h3>Share this tab</h3>
              <p>Scan to join and claim items.</p>
            </div>
            <TabQRCode tabId={tab.id} />
          </div>
        </Card>
      )}

      {/* Host: claim your own items */}
      {isHost && tab.status === "open" && (
        <div className="host-claim-section">
          <h2>Claim your items</h2>
          <div className="host-claim-list">
            {tab.items.map((item) => {
              const isClaimed = item.claimedBy.includes(tab.hostName);
              return (
                <label
                  key={item.id}
                  className={`host-claim-row ${isClaimed ? "claimed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isClaimed}
                    disabled={updatingItemId === item.id}
                    onChange={() => handleHostToggleClaim(item)}
                  />
                  <span className="host-claim-name">{item.name}</span>
                  <Money amount={item.price} size="sm" />
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Total & Progress */}
      <Card elevated className="total-card-premium">
        <div className="total-breakdown">
          <div className="progress-section">
            <ProgressRing
              total={tabTotal}
              claimed={claimedTotal}
              unclaimed={unclaimedTotal}
              size="lg"
            />
          </div>

          <div className="breakdown-section">
            <div className="breakdown-row">
              <span className="breakdown-label">Total bill</span>
              <Money amount={tabTotal} size="lg" highlight />
            </div>

            <div className="breakdown-row">
              <span className="breakdown-label">Assigned</span>
              <Money amount={claimedTotal} size="md" />
            </div>

            {unclaimedTotal > 0 && (
              <div className="breakdown-row breakdown-row--warning">
                <span className="breakdown-label">Unclaimed</span>
                <Money amount={unclaimedTotal} size="md" />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Unclaimed warning */}
      {unclaimedTotal > 0 && (
        <motion.div
          className="unclaimed-notice"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="notice-icon">⚠</span>
          <div className="notice-content">
            <h3>Items not claimed yet</h3>
            <span className="notice-copy">
              <Money amount={unclaimedTotal} size="sm" /> worth of items haven't been claimed.
              Someone might have forgotten!
            </span>
          </div>
        </motion.div>
      )}

      {/* Per-person balances */}
      <div className="balances-section">
        <h2>Who pays what</h2>

        <div className="balance-cards">
          {totals.length === 0 ? (
            <p className="empty-state">No items claimed yet. Everyone claim what they ordered!</p>
          ) : (
            totals.map((balance, index) => {
              const isCurrentUser = balance.name === guestName;
              return (
                <motion.div
                  key={balance.name}
                  className={`balance-card ${isCurrentUser ? "current-user" : ""}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="balance-card-content">
                    <div className="balance-header">
                      <div className="balance-name">
                        <span className="name">{balance.name}</span>
                        {isCurrentUser && <span className="you-badge">You</span>}
                      </div>
                      <Money amount={balance.amount} size="lg" highlight />
                    </div>

                    {tab.status !== "settled" && !isHost && isCurrentUser && (
                      <a
                        href={generateVenmoLink(tab.hostName, balance.amount)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pay-link"
                      >
                        <Button
                          variant="success"
                          size="sm"
                          className="pay-button"
                        >
                          Pay on Venmo →
                        </Button>
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Host actions */}
      {isHost && tab.status === "open" && (
        <div className="host-actions">
          <Button
            onClick={handleSettle}
            loading={settling}
            variant="primary"
            className="settle-button"
          >
            Mark as settled
          </Button>
        </div>
      )}

      {tab.status === "open" && !isHost && (
        <Button
          onClick={onBackToGuest}
          variant="secondary"
        >
          Back to items
        </Button>
      )}

      {tab.status === "settled" && (
        <motion.div
          className="settled-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2>All split. Nice work!</h2>
          <p>Everyone paid their share. Until next time! 🎉</p>
        </motion.div>
      )}
    </div>
  );
}
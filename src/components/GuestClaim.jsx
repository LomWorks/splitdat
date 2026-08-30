import { useState } from "react";
import { motion } from "motion/react";
import { toggleItemClaim } from "../services/tabs.js";
import { getGuestTotal, getItemShare } from "../utils/compute.js";
import {
  Button,
  Card,
  Money,
  AvatarStack,
  Toast,
} from "./ui/index.js";
import "../styles/GuestClaim.css";

export default function GuestClaim({
  tab,
  guestName,
  onGuestNameChange,
  onViewSummary,
}) {
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [copyToast, setCopyToast] = useState("");

  const normalizedName = guestName.trim();
  const yourTotal = getGuestTotal(tab.items, normalizedName);

  async function handleToggleClaim(item) {
    if (!normalizedName || tab.status === "settled" || updatingItemId) {
      return;
    }

    const alreadyClaimed = item.claimedBy.includes(normalizedName);

    try {
      setUpdatingItemId(item.id);

      await toggleItemClaim(
        tab.id,
        item.id,
        normalizedName,
        alreadyClaimed,
      );
    } catch (error) {
      console.error(error);
      setCopyToast("Could not update this item. Please try again.");
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleCopyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopyToast("Link copied to clipboard!");
    } catch (error) {
      console.error(error);
      setCopyToast("Could not copy link. Try manually copying from the address bar.");
    }
  }

  if (!normalizedName && tab.status !== "settled") {
    return (
      <div className="guest-screen-premium">
        <div className="guest-hero">
          <span className="eyebrow">
            {tab.status === "settled" ? "Tab settled" : `Hosted by ${tab.hostName}`}
          </span>
          <h1>{tab.tabName}</h1>
          <p>
            Tap everything you ordered. Shared items split automatically.
          </p>
        </div>

        <Card elevated className="name-card-premium">
          <div className="name-card-content">
            <label htmlFor="guestName" className="name-card-label">
              What should we call you?
            </label>

            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(event) => onGuestNameChange(event.target.value)}
              placeholder="Your first name"
              autoComplete="given-name"
              autoFocus
              className="name-input-premium"
            />

            <p className="helper-text">
              No account needed. Just a name for this tab.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="guest-screen-premium">
      <div className="guest-header">
        <div className="guest-hero">
          <span className="eyebrow">
            {tab.status === "settled" ? "✓ Tab settled" : `Hosted by ${tab.hostName}`}
          </span>
          <h1>{tab.tabName}</h1>
        </div>

        {normalizedName && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            icon="🔗"
          >
            Share
          </Button>
        )}
      </div>

      <div className="claim-items-receipt">
        {tab.items.map((item, index) => {
          const isClaimed = item.claimedBy.includes(normalizedName);
          const share = getItemShare(item, normalizedName);

          return (
            <motion.div
              key={item.id}
              className={`claim-item-row ${isClaimed ? "claimed" : ""} ${tab.status === "settled" ? "settled" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="claim-item-main">
                <div className="claim-item-name-price">
                  <h3 className="claim-item-name">{item.name}</h3>
                  <Money amount={item.price} size="md" highlight={isClaimed} />
                </div>

                {item.claimedBy.length > 0 && (
                  <div className="claim-item-claimants">
                    <AvatarStack names={item.claimedBy} size="sm" limit={3} />
                    <span className="claimant-count">
                      {item.claimedBy.length} {item.claimedBy.length === 1 ? "person" : "people"}
                    </span>
                  </div>
                )}

                {isClaimed && share > 0 && (
                  <div className="your-share">
                    <span className="your-share-label">Your split:</span>
                    <Money amount={share} size="md" />
                  </div>
                )}
              </div>

              <motion.button
                className={`claim-button ${isClaimed ? "active" : ""}`}
                onClick={() => handleToggleClaim(item)}
                disabled={tab.status === "settled" || updatingItemId === item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isClaimed ? "✓" : "+"}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {normalizedName && (
        <div className="your-bill-dock">
          <div className="dock-content">
            <div className="dock-label">Your share</div>
            <motion.div
              key={Math.round(yourTotal * 100)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Money
                amount={yourTotal}
                size="xl"
                highlight
              />
            </motion.div>
          </div>

          {tab.status !== "settled" && (
            <Button
              onClick={onViewSummary}
              variant="primary"
              className="dock-button"
            >
              Review split →
            </Button>
          )}
        </div>
      )}

      <Toast message={copyToast} type="success" />
    </div>
  );
}
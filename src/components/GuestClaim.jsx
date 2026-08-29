import { useState } from "react";
import { toggleItemClaim } from "../services/tabs.js";
import { getGuestTotal, getItemShare } from "../utils/compute.js";

const currency = new Intl.NumberFormat("en-US", {
style: "currency",
currency: "USD",
});

export default function GuestClaim({
tab,
guestName,
onGuestNameChange,
onViewSummary,
}) {
const [updatingItemId, setUpdatingItemId] = useState(null);

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
window.alert("Could not update this item. Please try again.");
} finally {
setUpdatingItemId(null);
}
}

return (
<div className="screen guest-screen">
<div className="tab-intro">
<span className="eyebrow">
{tab.status === "settled" ? "Tab settled" : `Hosted by ${tab.hostName}`}
</span>

<h1>{tab.tabName}</h1>

<p>
{tab.status === "settled"
? "This tab is closed. Thanks for splitting it fairly."
: "Tap everything you ordered. Shared items split automatically."}
</p>
</div>

{!normalizedName && tab.status !== "settled" && (
<div className="card name-card">
<label htmlFor="guestName">What should we call you?</label>

<input
id="guestName"
value={guestName}
onChange={(event) => onGuestNameChange(event.target.value)}
placeholder="Your first name"
autoComplete="given-name"
autoFocus
/>

<p className="helper-text">
No account needed. Just a name for this tab.
</p>
</div>
)}

<div className="claim-list">
{tab.items.map((item) => {
const isClaimed = item.claimedBy.includes(normalizedName);
const yourShare = getItemShare(item, normalizedName);
const isDisabled =
!normalizedName ||
tab.status === "settled" ||
updatingItemId === item.id;

return (
<button
className={`claim-card ${isClaimed ? "is-claimed" : ""}`}
key={item.id}
type="button"
disabled={isDisabled}
onClick={() => handleToggleClaim(item)}
>
<span className="claim-check" aria-hidden="true">
{isClaimed ? "✓" : ""}
</span>

<span className="claim-details">
<strong>{item.name}</strong>
<small>
{item.claimedBy.length === 0
? "Unclaimed"
: `${item.claimedBy.length} ${
item.claimedBy.length === 1 ? "person" : "people"
} sharing`}
</small>
</span>

<span className="claim-price">
<strong>{currency.format(item.price)}</strong>
{isClaimed && (
<small>Your share {currency.format(yourShare)}</small>
)}
</span>
</button>
);
})}
</div>

<div className="sticky-total">
<div>
<span>You owe</span>
<strong>{currency.format(yourTotal)}</strong>
</div>

<button
className="primary-button compact-button"
type="button"
onClick={onViewSummary}
>
Summary <span aria-hidden="true">→</span>
</button>
</div>
</div>
);
}


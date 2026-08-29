import {
getClaimedTotal,
getPeopleTotals,
getTabTotal,
getUnclaimedTotal,
} from "../utils/compute.js";

const currency = new Intl.NumberFormat("en-US", {
style: "currency",
currency: "USD",
});

export default function Summary({
tab,
guestName,
onBackToGuest,
onSettle,
}) {
const total = getTabTotal(tab.items);
const claimedTotal = getClaimedTotal(tab.items);
const unclaimedTotal = getUnclaimedTotal(tab.items);
const people = getPeopleTotals(tab.items);
const isSettled = tab.status === "settled";

const claimedPercentage =
total === 0 ? 0 : Math.min((claimedTotal / total) * 100, 100);

return (
<div className="screen summary-screen">
<div className="tab-intro">
<span className="eyebrow">{isSettled ? "All set" : "Live summary"}</span>
<h1>{isSettled ? "Tab settled." : tab.tabName}</h1>
<p>
{isSettled
? "Everyone’s share is saved below."
: "Every claim updates the split for the whole group."}
</p>
</div>

<section className="total-card">
<span>Total bill</span>
<strong>{currency.format(total)}</strong>

<div className="total-progress" aria-label={`${claimedPercentage}% claimed`}>
<span style={{ width: `${claimedPercentage}%` }} />
</div>

<div className="total-meta">
<span>{currency.format(claimedTotal)} assigned</span>
<span>{currency.format(unclaimedTotal)} remaining</span>
</div>
</section>

<section className="summary-section">
<div className="section-heading">
<div>
<span className="label">Who owes what</span>
<p>Shared items are split evenly.</p>
</div>
<span className="item-count">{people.length} people</span>
</div>

{people.length > 0 ? (
<div className="people-list">
{people.map((person) => {
const isYou = person.name === guestName.trim();

return (
<div className={`person-row ${isYou ? "is-you" : ""}`} key={person.name}>
<span className="person-avatar">
{person.name.slice(0, 1).toUpperCase()}
</span>

<span className="person-name">
{person.name}
{isYou && <small>You</small>}
</span>

<strong>{currency.format(person.amount)}</strong>
</div>
);
})}
</div>
) : (
<div className="empty-items">No items have been claimed yet.</div>
)}
</section>

{!isSettled && unclaimedTotal > 0 && (
<div className="notice-card">
<span className="notice-dot" />
<p>
{currency.format(unclaimedTotal)} is still unclaimed. Ask the group
to review the remaining items.
</p>
</div>
)}

<section className="card payment-card">
<div>
<span className="label">Ready when you are</span>
<h2>Settle up in one tap.</h2>
<p>Payment links are mocked for this demo.</p>
</div>

<button className="secondary-button" type="button">
Pay with Venmo <span aria-hidden="true">↗</span>
</button>
</section>

<div className="summary-actions">
<button
className="secondary-button"
type="button"
onClick={onBackToGuest}
>
Back to claims
</button>

{!isSettled && (
<button className="primary-button" type="button" onClick={onSettle}>
Mark as settled <span aria-hidden="true">✓</span>
</button>
)}
</div>
</div>
);
}
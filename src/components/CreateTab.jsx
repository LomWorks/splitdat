import { useState } from "react";
import "../styles/CreateTab.css";

const currency = new Intl.NumberFormat("en-US", {
style: "currency",
currency: "USD",
});

export default function CreateTab({ onCreate }) {
const [hostName, setHostName] = useState("");
const [tabName, setTabName] = useState("");
const [itemName, setItemName] = useState("");
const [itemPrice, setItemPrice] = useState("");
const [items, setItems] = useState([]);
const [creating, setCreating] = useState(false);

function addItem() {
const price = Number(itemPrice);

if (!itemName.trim() || !Number.isFinite(price) || price <= 0) {
return;
}

setItems((currentItems) => [
...currentItems,
{
id: crypto.randomUUID(),
name: itemName.trim(),
price,
claimedBy: [],
},
]);

setItemName("");
setItemPrice("");
}

function removeItem(itemId) {
setItems((currentItems) =>
currentItems.filter((item) => item.id !== itemId),
);
}

async function handleSubmit(event) {
event.preventDefault();

if (!hostName.trim() || !tabName.trim() || items.length === 0) {
return;
}

setCreating(true);

try {
await onCreate({
hostName: hostName.trim(),
tabName: tabName.trim(),
items,
});
} finally {
setCreating(false);
}
}

const canCreate =
hostName.trim().length > 0 &&
tabName.trim().length > 0 &&
items.length > 0;

return (
<div className="screen create-screen">
<div className="hero-copy">
<span className="eyebrow">Split bills in seconds</span>
<h1>One tab. Everyone pays their share.</h1>
<p>Create the bill, share one link, and let everyone claim what they had.</p>
</div>

<form className="card create-card" onSubmit={handleSubmit}>
<div className="form-section">
<label htmlFor="hostName">Your name</label>
<input
id="hostName"
value={hostName}
onChange={(event) => setHostName(event.target.value)}
placeholder="e.g. Maya"
autoComplete="name"
/>
</div>

<div className="form-section">
<label htmlFor="tabName">What are we splitting?</label>
<input
id="tabName"
value={tabName}
onChange={(event) => setTabName(event.target.value)}
placeholder="e.g. Dinner at Lilia"
/>
</div>

<div className="items-section">
<div className="section-heading">
<div>
<span className="label">Line items</span>
<p>Add what was ordered.</p>
</div>
<span className="item-count">{items.length} items</span>
</div>

<div className="add-item-row">
<input
value={itemName}
onChange={(event) => setItemName(event.target.value)}
onKeyDown={(event) => {
if (event.key === "Enter") {
event.preventDefault();
addItem();
}
}}
placeholder="Item name"
aria-label="Item name"
/>

<input
value={itemPrice}
onChange={(event) => setItemPrice(event.target.value)}
onKeyDown={(event) => {
if (event.key === "Enter") {
event.preventDefault();
addItem();
}
}}
placeholder="$0.00"
inputMode="decimal"
aria-label="Item price"
/>

<button
className="icon-button"
type="button"
onClick={addItem}
aria-label="Add item"
>
+
</button>
</div>

{items.length > 0 ? (
<div className="item-list">
{items.map((item) => (
<div className="editable-item" key={item.id}>
<span>{item.name}</span>

<span className="editable-item-price">
{currency.format(item.price)}
</span>

<button
className="remove-button"
type="button"
onClick={() => removeItem(item.id)}
aria-label={`Remove ${item.name}`}
>
×
</button>
</div>
))}
</div>
) : (
<div className="empty-items">Add your first item to begin.</div>
)}
</div>

<button
className="primary-button"
type="submit"
disabled={!canCreate || creating}
>
{creating ? "Creating tab…" : "Create & share tab"}
<span aria-hidden="true">→</span>
</button>
</form>
</div>
);
}


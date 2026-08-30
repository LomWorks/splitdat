import { useState } from "react";
import { Button, Card, Money } from "../index.js";
import "../styles/CreateTab.css";

export default function CreateTab({ onCreate }) {
  const [hostName, setHostName] = useState("");
  const [tabName, setTabName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [items, setItems] = useState([]);
  const [creating, setCreating] = useState(false);

  function addItem() {
    const price = Number(itemPrice);
    if (!itemName.trim() || !Number.isFinite(price) || price <= 0) return;

    setItems((current) => [
      ...current,
      { id: crypto.randomUUID(), name: itemName.trim(), price, claimedBy: [] },
    ]);
    setItemName("");
    setItemPrice("");
  }

  function removeItem(itemId) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!hostName.trim() || !tabName.trim() || items.length === 0) return;

    setCreating(true);
    try {
      await onCreate({ hostName: hostName.trim(), tabName: tabName.trim(), items });
    } finally {
      setCreating(false);
    }
  }

  const canCreate =
    hostName.trim().length > 0 && tabName.trim().length > 0 && items.length > 0;

  return (
    <div className="create-screen">
      <div className="create-hero">
        <span className="eyebrow">Split bills in seconds</span>
        <h1>One tab. Everyone pays their share.</h1>
        <p>Create the bill, share one link, and let everyone claim what they had.</p>
      </div>

      <Card elevated className="create-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label htmlFor="hostName">Your name</label>
            <input
              id="hostName"
              className="create-input"
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
              className="create-input"
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
                className="create-input"
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
                className="create-input"
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
              <div className="items-receipt">
                {items.map((item) => (
                  <div className="editable-item-row" key={item.id}>
                    <span className="editable-item-name">{item.name}</span>
                    <Money amount={item.price} size="sm" />
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

          <Button
            type="submit"
            variant="primary"
            className="create-submit"
            disabled={!canCreate || creating}
          >
            {creating ? "Creating tab…" : "Create & share tab"} <span aria-hidden="true">→</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
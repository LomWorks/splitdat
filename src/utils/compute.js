const roundMoney = (amount) =>
Math.round((amount + Number.EPSILON) * 100) / 100;

export function getItemShare(item, guestName) {
if (!guestName || !item.claimedBy?.includes(guestName)) return 0;
if (!item.claimedBy.length) return 0;

return roundMoney(item.price / item.claimedBy.length);
}

export function getGuestTotal(items, guestName) {
return roundMoney(
items.reduce((total, item) => total + getItemShare(item, guestName), 0),
);
}

export function getPeopleTotals(items) {
const totals = new Map();

items.forEach((item) => {
if (!item.claimedBy?.length) return;

const share = item.price / item.claimedBy.length;

item.claimedBy.forEach((name) => {
totals.set(name, (totals.get(name) ?? 0) + share);
});
});

return [...totals.entries()]
.map(([name, amount]) => ({
name,
amount: roundMoney(amount),
}))
.sort((a, b) => b.amount - a.amount);
}

export function getTabTotal(items) {
return roundMoney(items.reduce((total, item) => total + item.price, 0));
}

export function getClaimedTotal(items) {
return roundMoney(
items.reduce(
(total, item) => total + (item.claimedBy?.length ? item.price : 0),
0,
),
);
}

export function getUnclaimedTotal(items) {
return roundMoney(
items.reduce(
(total, item) => total + (!item.claimedBy?.length ? item.price : 0),
0,
),
);
}

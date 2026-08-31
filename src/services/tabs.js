import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { traceFirestoreOperation } from "./tracing.js";

export async function createTab({ hostName, tabName, items }) {
  return traceFirestoreOperation("createTab", async () => {
    const tabRef = await addDoc(collection(db, "tabs"), {
      hostName,
      tabName,
      status: "open",
      createdAt: serverTimestamp(),
    });

    await Promise.all(
      items.map((item, index) =>
        addDoc(collection(db, "tabs", tabRef.id, "items"), {
          name: item.name,
          price: Number(item.price),
          claimedBy: [],
          position: index,
        }),
      ),
    );

    return tabRef.id;
  });
}

export async function toggleItemClaim(tabId, itemId, guestName, isClaimed) {
  return traceFirestoreOperation("toggleItemClaim", async () => {
    const itemRef = doc(db, "tabs", tabId, "items", itemId);

    await updateDoc(itemRef, {
      claimedBy: isClaimed ? arrayRemove(guestName) : arrayUnion(guestName),
    });
  });
}

export async function setTabStatus(tabId, status) {
  return traceFirestoreOperation("setTabStatus", async () => {
    const tabRef = doc(db, "tabs", tabId);
    await updateDoc(tabRef, { status });
  });
}

// Not wrapped in traceFirestoreOperation — this is a long-lived subscription,
// not a single request/response, so a duration trace doesn't apply here.
export function subscribeToTab(tabId, onChange, onError) {
  const tabRef = doc(db, "tabs", tabId);

  const itemsQuery = query(
    collection(db, "tabs", tabId, "items"),
    orderBy("position", "asc"),
  );

  let tabData = null;
  let items = [];

  function emit() {
    if (!tabData) return;

    onChange({
      id: tabId,
      ...tabData,
      items,
    });
  }

  const unsubscribeTab = onSnapshot(
    tabRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }

      tabData = snapshot.data();
      emit();
    },
    onError,
  );

  const unsubscribeItems = onSnapshot(
    itemsQuery,
    (snapshot) => {
      items = snapshot.docs.map((snapshot) => ({
        id: snapshot.id,
        ...snapshot.data(),
      }));
      emit();
    },
    onError,
  );

  return () => {
    unsubscribeTab();
    unsubscribeItems();
  };
}
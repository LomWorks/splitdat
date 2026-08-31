import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import ReceiptScene from "./components/scene/ReceiptScene.jsx";
import PerformanceMonitor from "./components/scene/PerformanceMonitor.jsx";
import Logo from "./components/Logo.jsx";
import CreateTab from "./components/CreateTab.jsx";
import GuestClaim from "./components/GuestClaim.jsx";
import Summary from "./components/Summary.jsx";
import { ensureAnonymousAuth } from "./services/firebase.js";
import { createTab, setTabStatus, subscribeToTab } from "./services/tabs.js";
import { logEvent } from "./lib/executionLog.js";
import "./App.css";

function getRoute() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  if (parts[0] === "tab" && parts[1]) {
    return {
      tabId: parts[1],
      screen: parts[2] === "summary" ? "summary" : "guest",
    };
  }

  return { tabId: null, screen: "create" };
}

export default function App() {
  const initialRoute = useMemo(getRoute, []);
  const [route, setRoute] = useState(initialRoute);
  const [tab, setTab] = useState(null);
  const [guestName, setGuestName] = useState(
    () => localStorage.getItem(`splitdat-guest-${initialRoute.tabId}`) ?? "",
  );
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(Boolean(initialRoute.tabId));
  const [error, setError] = useState("");

  useEffect(() => {
    ensureAnonymousAuth()
      .then(() => setAuthReady(true))
      .catch((authError) => {
        console.error(authError);
        setError("Could not start a secure session. Check Firebase Auth.");
      });
  }, []);

  useEffect(() => {
    if (!authReady || !route.tabId) {
      setTab(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError("");

    return subscribeToTab(
      route.tabId,
      (nextTab) => {
        setTab(nextTab);
        setLoading(false);

        if (!nextTab) {
          setError("This tab could not be found.");
        }
      },
      (firestoreError) => {
        console.error(firestoreError);
        setLoading(false);
        setError("Could not connect to the live tab.");
      },
    );
  }, [authReady, route.tabId]);

  useEffect(() => {
    if (!route.tabId) return;

    localStorage.setItem(`splitdat-guest-${route.tabId}`, guestName);
  }, [guestName, route.tabId]);

  useEffect(() => {
    function handlePopState() {
      setRoute(getRoute());
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function navigate(tabId, screen = "guest") {
    const path =
      screen === "create"
        ? "/"
        : screen === "summary"
          ? `/tab/${tabId}/summary`
          : `/tab/${tabId}`;

    window.history.pushState({}, "", path);
    setRoute({
      tabId: screen === "create" ? null : tabId,
      screen,
    });
  }

  async function handleCreateTab(data) {
    try {
      setError("");
      const tabId = await createTab(data);
      logEvent("tab.create", { tabId, hostName: data.hostName, itemCount: data.items.length });
      setGuestName(data.hostName);
      navigate(tabId, "guest");
    } catch (createError) {
      console.error(createError);
      setError("Could not create the tab. Check Firestore rules and setup.");
    }
  }

  async function handleSettle() {
    if (!tab) return;

    try {
      await setTabStatus(tab.id, "settled");
      logEvent("tab.settle", { tabId: tab.id });
    } catch (settleError) {
      console.error(settleError);
      setError("Could not settle this tab.");
    }
  }

  return (
    <main className="app-shell">
      <div className="scene-backdrop" aria-hidden="true">
        <Canvas camera={{ position: [0, 0, 6], fov: 40 }} dpr={[1, 2]}>
          <ReceiptScene screen={route.screen} />
          <PerformanceMonitor onSample={(stats) => logEvent("perf.sample", stats)} />
        </Canvas>
      </div>
      <header className="topbar">
        <button
          className="brand-button"
          type="button"
          onClick={() => navigate(null, "create")}
          aria-label="Create a new splitdat tab"
        >
          <Logo />
        </button>

        {tab && (
          <div className="topbar-actions">
            <button
              className="text-button"
              type="button"
              onClick={() => navigate(tab.id, "guest")}
            >
              Guest view
            </button>

            <button
              className="text-button"
              type="button"
              onClick={() => navigate(tab.id, "summary")}
            >
              Summary
            </button>
          </div>
        )}
      </header>

      <section className="page-content">
        {error && <div className="app-error">{error}</div>}

        {!authReady && (
          <div className="loading-state">Starting secure session…</div>
        )}

        {authReady && route.screen === "create" && (
          <CreateTab onCreate={handleCreateTab} />
        )}

        {authReady && loading && (
          <div className="loading-state">Loading live tab…</div>
        )}

        {authReady && !loading && route.screen === "guest" && tab && (
          <GuestClaim
            tab={tab}
            guestName={guestName}
            onGuestNameChange={setGuestName}
            onViewSummary={() => navigate(tab.id, "summary")}
          />
        )}

        {authReady && !loading && route.screen === "summary" && tab && (
          <Summary
            tab={tab}
            guestName={guestName}
            onBackToGuest={() => navigate(tab.id, "guest")}
            onSettle={handleSettle}
          />
        )}
      </section>
    </main>
  );
}
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
    const t0 = performance.now();
    ensureAnonymousAuth()
      .then(() => {
        const duration = Math.round(performance.now() - t0);
        setAuthReady(true);
        logEvent("auth.ready", { durationMs: duration });
      })
      .catch((authError) => {
        const duration = Math.round(performance.now() - t0);
        console.error(authError);
        logEvent("auth.error", { durationMs: duration, message: authError.message });
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

    const t0 = performance.now();
    let firstEmit = true;

    return subscribeToTab(
      route.tabId,
      (nextTab) => {
        if (firstEmit) {
          const duration = Math.round(performance.now() - t0);
          logEvent("tab.subscribe.ready", { tabId: route.tabId, durationMs: duration });
          firstEmit = false;
        }

        setTab(nextTab);
        setLoading(false);

        if (!nextTab) {
          setError("This tab could not be found.");
          logEvent("tab.not.found", { tabId: route.tabId });
        }
      },
      (firestoreError) => {
        const duration = Math.round(performance.now() - t0);
        console.error(firestoreError);
        logEvent("tab.subscribe.error", {
          tabId: route.tabId,
          durationMs: duration,
          message: firestoreError.message,
        });
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
    return () => window.removeEventListener("popstate", handlePopState);
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
    const t0 = performance.now();
    try {
      setError("");
      const tabId = await createTab(data);
      const duration = Math.round(performance.now() - t0);
      logEvent("tab.create", {
        tabId,
        hostName: data.hostName,
        itemCount: data.items.length,
        durationMs: duration,
      });
      setGuestName(data.hostName);
      navigate(tabId, "guest");
    } catch (createError) {
      const duration = Math.round(performance.now() - t0);
      console.error(createError);
      logEvent("tab.create.error", {
        durationMs: duration,
        message: createError.message,
      });
      setError("Could not create the tab. Check Firestore rules and setup.");
    }
  }

  async function handleSettle() {
    if (!tab) return;

    const t0 = performance.now();
    try {
      await setTabStatus(tab.id, "settled");
      const duration = Math.round(performance.now() - t0);
      logEvent("tab.settle", { tabId: tab.id, durationMs: duration });
    } catch (settleError) {
      const duration = Math.round(performance.now() - t0);
      console.error(settleError);
      logEvent("tab.settle.error", {
        tabId: tab.id,
        durationMs: duration,
        message: settleError.message,
      });
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

            {import.meta.env.DEV && (
              <button
                className="text-button"
                type="button"
                onClick={() => window.splitdatLog.exportExecutionLog()}
              >
                Export log
              </button>
            )}
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
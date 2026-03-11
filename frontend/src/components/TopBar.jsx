// frontend/src/components/TopBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TopBar = ({ onLogout }) => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [search, setSearch] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Workout missed yesterday", time: "2h", read: false },
    { id: 2, text: "New AI tip available", time: "1d", read: false },
    { id: 3, text: "Protein target hit", time: "3d", read: true },
  ]);

  // Example quick stat values - you can fetch these from your API if available
  const calories = 245;
  const streak = 12;

  // Keyboard shortcut for focusing search: Ctrl+K / ⌘K
  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const hotkey = isMac ? e.metaKey && e.key.toLowerCase() === "k" : e.ctrlKey && e.key.toLowerCase() === "k";
      if (hotkey) {
        e.preventDefault();
        searchRef.current?.focus();
      }

      // Escape closes dropdowns
      if (e.key === "Escape") {
        setIsNotifOpen(false);
        setIsUserOpen(false);
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest(".notification-btn")) setIsNotifOpen(false);
      if (!e.target.closest(".user-menu")) setIsUserOpen(false);
    };
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, []);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    // simple behavior for now: navigate to search results page
    navigate(`/search?q=${encodeURIComponent(search)}`);
    setSearch("");
  };

  const openNotif = () => {
    setIsNotifOpen((s) => !s);
    setIsUserOpen(false);
  };

  const openUser = () => {
    setIsUserOpen((s) => !s);
    setIsNotifOpen(false);
  };

  const markAllRead = () => {
    setNotifications((n) => n.map(x => ({ ...x, read: true })));
    setNotifCount(0);
  };

  const onCalClick = () => navigate("/diet");
  const onStreakClick = () => navigate("/progress");
  const onSettings = () => navigate("/settings");
  const onProfile = () => navigate("/profile");

  // keyboard handler factory for role="button" elements
  const keyPressHandler = (fn) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div className="topbar" role="banner" aria-label="Topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
        {/* Search */}
        <form onSubmit={onSearchSubmit} className={`search-container`} style={{ maxWidth: 720 }}>
          <span className="search-icon" aria-hidden>🔍</span>
          <input
            ref={searchRef}
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search our database..."
            aria-label="Search database"
          />
          <div className="search-shortcut" aria-hidden>
            <kbd style={{ padding: "4px 6px", borderRadius: 6, background: "rgba(148,163,184,0.06)", fontSize: 12 }}>Ctrl</kbd>
            <span style={{ fontSize: 12, opacity: 0.7 }}>+</span>
            <kbd style={{ padding: "4px 6px", borderRadius: 6, background: "rgba(148,163,184,0.06)", fontSize: 12 }}>K</kbd>
          </div>
        </form>
      </div>

      <div className="topbar-actions" style={{ alignItems: "center" }}>
        {/* Quick stat: calories */}
        <div
          className="quick-stat"
          role="button"
          tabIndex={0}
          onClick={onCalClick}
          onKeyDown={keyPressHandler(onCalClick)}
          title="Calories — view diet"
          aria-label={`Calories ${calories} — click to open diet`}
        >
          <div className="stat-icon">🔥</div>
          <div className="stat-content" style={{ textAlign: "left" }}>
            <div className="stat-value" style={{ fontWeight: 800 }}>{calories}</div>
            <div className="stat-label" style={{ fontSize: 11 }}>Cal</div>
          </div>
        </div>

        <div style={{ width: 8 }} />

        {/* Quick stat: streak */}
        <div
          className="quick-stat"
          role="button"
          tabIndex={0}
          onClick={onStreakClick}
          onKeyDown={keyPressHandler(onStreakClick)}
          title="Streak — view progress"
          aria-label={`Streak ${streak} days — click to open progress`}
        >
          <div className="stat-icon">⚡</div>
          <div className="stat-content" style={{ textAlign: "left" }}>
            <div className="stat-value" style={{ fontWeight: 800 }}>{streak}</div>
            <div className="stat-label" style={{ fontSize: 11 }}>Streak</div>
          </div>
        </div>

        <div style={{ width: 8 }} />
        <div className="topbar-divider" />

        {/* Notifications */}
        <div style={{ position: "relative" }} className="notification-btn">
          <button
            className="topbar-btn"
            aria-haspopup="true"
            aria-expanded={isNotifOpen}
            aria-controls="notifications-dropdown"
            onClick={openNotif}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNotif(); } }}
            title="Notifications"
          >
            {/* small bell svg */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 17H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {notifCount > 0 && (
              <div className="notification-badge" aria-hidden>
                {notifCount}
              </div>
            )}
          </button>

          {/* Notifications dropdown */}
          {isNotifOpen && (
            <div
              id="notifications-dropdown"
              role="menu"
              aria-label="Notifications"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                minWidth: 320,
                background: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(148,163,184,0.12)",
                borderRadius: 12,
                boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                padding: 12,
                zIndex: 200
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ color: "#f1f5f9" }}>Notifications</strong>
                <button
                  className="btn-link"
                  onClick={markAllRead}
                  style={{ fontSize: 13 }}
                >
                  Mark all read
                </button>
              </div>

              {notifications.length === 0 && <div style={{ color: "#94a3b8" }}>No notifications</div>}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      // open related page — simple example
                      setIsNotifOpen(false);
                      navigate("/progress");
                    }}
                    onKeyDown={keyPressHandler(() => {
                      setIsNotifOpen(false);
                      navigate("/progress");
                    })}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: n.read ? "transparent" : "rgba(59,130,246,0.06)",
                      border: "1px solid rgba(148,163,184,0.04)",
                      cursor: "pointer",
                      color: "#cbd5e1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.08)", display: "grid", placeItems: "center" }}>
                        🔔
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{n.text}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{n.time}</div>
                      </div>
                    </div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          className="topbar-btn"
          title="Settings"
          onClick={onSettings}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSettings(); }}
          aria-label="Open settings"
        >
          ⚙️
        </button>

        {/* User Avatar + menu */}
        <div className="user-menu" style={{ position: "relative", marginLeft: 6 }}>
          <button
            className="user-avatar-topbar"
            onClick={openUser}
            aria-haspopup="true"
            aria-expanded={isUserOpen}
            aria-controls="user-dropdown"
            title="Open user menu"
            style={{ width: 44, height: 44 }}
          >
            <img
              alt="User avatar"
              src="https://avatars.dicebear.com/api/bottts/default.svg"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
            />
          </button>

          {isUserOpen && (
            <div
              id="user-dropdown"
              role="menu"
              aria-label="User menu"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                minWidth: 200,
                background: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(148,163,184,0.12)",
                borderRadius: 12,
                boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                padding: 8,
                zIndex: 200
              }}
            >
              <div
                className="dropdown-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => { setIsUserOpen(false); onProfile(); }}
                onKeyDown={keyPressHandler(() => { setIsUserOpen(false); onProfile(); })}
              >
                <span className="dropdown-icon">👤</span>
                <div>
                  <div style={{ fontWeight: 800, color: "#f1f5f9" }}>Manish Rawat</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>View profile</div>
                </div>
              </div>

              <div className="dropdown-divider" style={{ margin: "8px 0" }} />

              <div
                className="dropdown-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => { setIsUserOpen(false); navigate("/settings"); }}
                onKeyDown={keyPressHandler(() => { setIsUserOpen(false); navigate("/settings"); })}
              >
                <span className="dropdown-icon">⚙️</span>
                Settings
              </div>

              <div
                className="dropdown-item danger"
                role="menuitem"
                tabIndex={0}
                onClick={() => { setIsUserOpen(false); if (onLogout) onLogout(); else navigate("/login", { replace: true }); }}
                onKeyDown={keyPressHandler(() => { setIsUserOpen(false); if (onLogout) onLogout(); else navigate("/login", { replace: true }); })}
                style={{ marginTop: 6 }}
              >
                <span className="dropdown-icon">🔓</span>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;

import React, { useState, useMemo } from "react";

const CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: "🍜", color: "#f97316" },
  { id: "transport", label: "Transport", icon: "🚇", color: "#3b82f6" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#ec4899" },
  { id: "health", label: "Health", icon: "💊", color: "#22c55e" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#a855f7" },
  { id: "utilities", label: "Utilities", icon: "⚡", color: "#eab308" },
  { id: "housing", label: "Housing", icon: "🏠", color: "#14b8a6" },
  { id: "other", label: "Other", icon: "📦", color: "#94a3b8" },
];

const INITIAL_EXPENSES = [
  { id: 1, title: "Grocery run — Zepto", amount: 1240, category: "food", date: "2026-06-01", note: "Weekly essentials" },
  { id: 2, title: "Metro card recharge", amount: 500, category: "transport", date: "2026-06-01", note: "" },
  { id: 3, title: "Dinner at Social", amount: 1850, category: "food", date: "2026-05-31", note: "With friends" },
  { id: 4, title: "Amazon — headphones", amount: 3499, category: "shopping", date: "2026-05-30", note: "WFH upgrade" },
  { id: 5, title: "Netflix subscription", amount: 649, category: "entertainment", date: "2026-05-30", note: "Monthly" },
  { id: 6, title: "Gym membership", amount: 2000, category: "health", date: "2026-05-29", note: "June fee" },
  { id: 7, title: "Electricity bill", amount: 1125, category: "utilities", date: "2026-05-28", note: "May bill" },
  { id: 8, title: "Ola ride — airport", amount: 680, category: "transport", date: "2026-05-27", note: "" },
  { id: 9, title: "Zomato — biryani", amount: 420, category: "food", date: "2026-05-27", note: "" },
  { id: 10, title: "Rent — June", amount: 18000, category: "housing", date: "2026-05-26", note: "Transferred to landlord" },
  { id: 11, title: "Pharmacy", amount: 385, category: "health", date: "2026-05-25", note: "Cold medicine" },
  { id: 12, title: "BookMyShow — movie", amount: 760, category: "entertainment", date: "2026-05-24", note: "Mission Impossible 9" },
  { id: 13, title: "Myntra haul", amount: 2150, category: "shopping", date: "2026-05-23", note: "Summer clothes" },
  { id: 14, title: "Coffee subscription", amount: 999, category: "food", date: "2026-05-22", note: "Blue Tokai" },
  { id: 15, title: "Internet bill", amount: 799, category: "utilities", date: "2026-05-21", note: "JioFiber" },
];

const MONTHLY_BUDGET = 40000;

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function MiniBarChart({ data, max }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${Math.max(6, (v / max) * 100)}%`,
          background: i === data.length - 1 ? "#c8f04a" : "rgba(200,240,74,0.25)",
          borderRadius: 3,
          transition: "height 0.4s ease",
        }} />
      ))}
    </div>
  );
}

function DonutChart({ segments, size = 100 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumulative = 0;
  const r = 38, cx = 50, cy = 50, circumference = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
      {segments.map((seg, i) => {
        const frac = seg.value / total;
        const offset = circumference * (1 - frac);
        const rotation = (cumulative / total) * 360 - 90;
        cumulative += seg.value;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${circumference * frac} ${circumference * (1 - frac)}`}
            strokeDashoffset={0}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            style={{ transition: "all 0.5s ease" }}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={28} fill="#151a20" />
    </svg>
  );
}

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [form, setForm] = useState({ title: "", amount: "", category: "food", date: new Date().toISOString().split("T")[0], note: "" });
  const [toast, setToast] = useState(null);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const remaining = MONTHLY_BUDGET - totalSpent;
  const budgetPct = Math.min(100, (totalSpent / MONTHLY_BUDGET) * 100);

  const categoryTotals = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => map[c.id] = 0);
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return map;
  }, [expenses]);

  const topCategories = useMemo(() =>
    CATEGORIES.map(c => ({ ...c, total: categoryTotals[c.id] }))
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
    [categoryTotals]
  );

  const donutSegments = topCategories.map(c => ({ color: c.color, value: c.total }));

  const weeklyData = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date("2026-06-03");
    expenses.forEach(e => {
      const diff = Math.floor((now - new Date(e.date)) / 86400000);
      if (diff >= 0 && diff < 7) buckets[6 - diff] += e.amount;
    });
    return buckets;
  }, [expenses]);

  const maxWeekly = Math.max(...weeklyData, 1);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => filterCat === "all" || e.category === filterCat)
      .filter(e => !searchQ || e.title.toLowerCase().includes(searchQ.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, filterCat, searchQ]);

  function addExpense() {
    if (!form.title || !form.amount) return;
    const newExp = { ...form, id: Date.now(), amount: parseFloat(form.amount) };
    setExpenses(prev => [newExp, ...prev]);
    setShowAddModal(false);
    setForm({ title: "", amount: "", category: "food", date: new Date().toISOString().split("T")[0], note: "" });
    showToast("Expense added ✓");
  }

  function deleteExpense(id) {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast("Deleted");
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7];

  const styles = {
    root: {
      fontFamily: "'DM Mono', 'Courier New', monospace",
      background: "#0e1117",
      minHeight: "100vh",
      color: "#e8eaf0",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
    },
    topGlow: {
      position: "fixed", top: -80, left: "50%", transform: "translateX(-50%)",
      width: 320, height: 200,
      background: "radial-gradient(ellipse, rgba(200,240,74,0.12) 0%, transparent 70%)",
      pointerEvents: "none", zIndex: 0,
    },
    header: {
      padding: "20px 20px 0",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      position: "relative", zIndex: 1,
    },
    logoText: {
      fontSize: 13, fontWeight: 700, letterSpacing: "0.12em",
      color: "#c8f04a", textTransform: "uppercase",
    },
    addBtn: {
      background: "#c8f04a", color: "#0e1117",
      border: "none", borderRadius: 10, padding: "8px 16px",
      fontSize: 13, fontWeight: 700, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 5,
      letterSpacing: "0.04em",
    },
    content: { padding: "16px 20px 90px", position: "relative", zIndex: 1 },
    // Hero card
    heroCard: {
      background: "linear-gradient(135deg, #1a2010 0%, #1e2a0e 50%, #141a0a 100%)",
      border: "1px solid rgba(200,240,74,0.2)",
      borderRadius: 20, padding: 20, marginBottom: 16,
    },
    heroLabel: { fontSize: 10, letterSpacing: "0.2em", color: "#7a8a60", textTransform: "uppercase", marginBottom: 4 },
    heroAmount: { fontSize: 32, fontWeight: 700, color: "#c8f04a", letterSpacing: "-0.02em", lineHeight: 1 },
    heroSub: { fontSize: 11, color: "#7a8a60", marginTop: 4 },
    progressBar: {
      background: "rgba(200,240,74,0.1)", borderRadius: 4, height: 5,
      marginTop: 14, overflow: "hidden",
    },
    progressFill: {
      height: "100%", borderRadius: 4,
      background: budgetPct > 85 ? "#ef4444" : budgetPct > 65 ? "#f97316" : "#c8f04a",
      width: `${budgetPct}%`, transition: "width 0.6s ease",
    },
    // Grid cards
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
    card: {
      background: "#151a20", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, padding: 16,
    },
    cardLabel: { fontSize: 9, letterSpacing: "0.18em", color: "#4a5568", textTransform: "uppercase", marginBottom: 6 },
    cardValue: { fontSize: 18, fontWeight: 700, color: "#e8eaf0" },
    cardSub: { fontSize: 10, color: "#4a5568", marginTop: 3 },
    sectionTitle: { fontSize: 11, letterSpacing: "0.15em", color: "#4a5568", textTransform: "uppercase", marginBottom: 10 },
    // Category rows
    catRow: {
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    },
    catIcon: { fontSize: 18, width: 32, textAlign: "center" },
    catBar: {
      flex: 1, height: 3, background: "rgba(255,255,255,0.06)",
      borderRadius: 2, overflow: "hidden",
    },
    // Expense rows
    expRow: {
      display: "flex", alignItems: "center", gap: 12, padding: "11px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "default",
    },
    expIcon: {
      width: 36, height: 36, borderRadius: 10, display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
    },
    expTitle: { fontSize: 13, fontWeight: 500, color: "#d8dae0", lineHeight: 1.2 },
    expDate: { fontSize: 10, color: "#4a5568", marginTop: 2 },
    expAmount: { fontSize: 13, fontWeight: 700, marginLeft: "auto", flexShrink: 0 },
    deleteBtn: {
      background: "none", border: "none", color: "#ef4444", cursor: "pointer",
      fontSize: 14, padding: "0 4px", opacity: 0.5, flexShrink: 0,
    },
    // Nav
    nav: {
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      background: "rgba(14,17,23,0.95)", backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex", justifyContent: "space-around",
      padding: "10px 0 16px", zIndex: 100,
    },
    navItem: (active) => ({
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 3, cursor: "pointer", padding: "4px 16px",
      color: active ? "#c8f04a" : "#4a5568",
      fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
      background: "none", border: "none", fontFamily: "inherit",
      transition: "color 0.2s",
    }),
    // Modal
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(6px)", zIndex: 200,
      display: "flex", alignItems: "flex-end",
    },
    modal: {
      background: "#151a20", borderRadius: "24px 24px 0 0",
      border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none",
      padding: 24, width: "100%", maxWidth: 480, margin: "0 auto",
    },
    modalTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#e8eaf0" },
    label: { fontSize: 10, letterSpacing: "0.15em", color: "#4a5568", textTransform: "uppercase", display: "block", marginBottom: 6 },
    input: {
      width: "100%", background: "#0e1117", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "12px 14px", color: "#e8eaf0",
      fontSize: 14, fontFamily: "inherit", marginBottom: 14, boxSizing: "border-box",
      outline: "none",
    },
    catGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 },
    catBtn: (active, color) => ({
      background: active ? `${color}22` : "#0e1117",
      border: `1px solid ${active ? color : "rgba(255,255,255,0.06)"}`,
      borderRadius: 10, padding: "8px 4px", cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      fontSize: 18, color: "#e8eaf0",
    }),
    catBtnLabel: { fontSize: 8, letterSpacing: "0.08em", color: "#7a8a60" },
    submitBtn: {
      width: "100%", background: "#c8f04a", color: "#0e1117",
      border: "none", borderRadius: 12, padding: "14px",
      fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em",
    },
    // Toast
    toast: {
      position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
      background: "#c8f04a", color: "#0e1117", padding: "8px 20px",
      borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 300,
      letterSpacing: "0.08em", animation: "fadeIn 0.2s ease",
    },
    searchBar: {
      background: "#151a20", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12, padding: "10px 14px", color: "#e8eaf0",
      fontSize: 13, fontFamily: "inherit", width: "100%",
      boxSizing: "border-box", outline: "none", marginBottom: 12,
    },
    filterRow: {
      display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4,
    },
    filterChip: (active, color) => ({
      background: active ? `${color}22` : "#151a20",
      border: `1px solid ${active ? color : "rgba(255,255,255,0.06)"}`,
      color: active ? color : "#4a5568",
      borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer",
      whiteSpace: "nowrap", fontFamily: "inherit", letterSpacing: "0.06em",
    }),
  };

  const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity:0; transform: translate(-50%,-6px); } to { opacity:1; transform: translate(-50%,0); } }
        input::placeholder { color: #2a3040; }
      `}</style>

      <div style={styles.topGlow} />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.logoLabel}>
            <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#4a5568", textTransform: "uppercase" }}>Personal Finance</span>
          </div>
          <div style={styles.logoText}>₹ ExpenseOS</div>
        </div>
        <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
          + Add
        </button>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.content}>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            {/* Hero Card */}
            <div style={styles.heroCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={styles.heroLabel}>Spent this month</div>
                  <div style={styles.heroAmount}>{formatINR(totalSpent)}</div>
                  <div style={styles.heroSub}>of {formatINR(MONTHLY_BUDGET)} budget</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#7a8a60", textTransform: "uppercase", marginBottom: 4 }}>Remaining</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: remaining >= 0 ? "#c8f04a" : "#ef4444" }}>
                    {formatINR(Math.abs(remaining))}
                  </div>
                  <div style={{ fontSize: 9, color: "#4a5568", marginTop: 2 }}>{remaining < 0 ? "over budget" : "left"}</div>
                </div>
              </div>
              <div style={styles.progressBar}>
                <div style={styles.progressFill} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 9, color: "#4a5568" }}>0%</span>
                <span style={{ fontSize: 9, color: budgetPct > 85 ? "#ef4444" : "#7a8a60" }}>{budgetPct.toFixed(0)}% used</span>
                <span style={{ fontSize: 9, color: "#4a5568" }}>100%</span>
              </div>
            </div>

            {/* Stats grid */}
            <div style={styles.grid2}>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Transactions</div>
                <div style={styles.cardValue}>{expenses.length}</div>
                <div style={styles.cardSub}>this month</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Daily avg</div>
                <div style={styles.cardValue}>{formatINR(Math.round(totalSpent / 30))}</div>
                <div style={styles.cardSub}>per day</div>
              </div>
            </div>

            {/* Weekly chart */}
            <div style={{ ...styles.card, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={styles.sectionTitle}>7-day activity</div>
                <div style={{ fontSize: 11, color: "#c8f04a" }}>{formatINR(weeklyData.reduce((a, b) => a + b, 0))}</div>
              </div>
              <MiniBarChart data={weeklyData} max={maxWeekly} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {DAYS.map((d, i) => (
                  <span key={i} style={{ fontSize: 8, color: i === 6 ? "#c8f04a" : "#2a3040", letterSpacing: "0.1em", flex: 1, textAlign: "center" }}>{d}</span>
                ))}
              </div>
            </div>

            {/* Spending by category */}
            <div style={{ ...styles.card, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={styles.sectionTitle}>By category</div>
                <DonutChart segments={donutSegments} size={60} />
              </div>
              {topCategories.map(cat => {
                const pct = totalSpent ? (cat.total / totalSpent) * 100 : 0;
                return (
                  <div key={cat.id} style={styles.catRow}>
                    <div style={styles.catIcon}>{cat.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#c8cad0", marginBottom: 4 }}>{cat.label}</div>
                      <div style={styles.catBar}>
                        <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 2, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 60 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{formatINR(cat.total)}</div>
                      <div style={{ fontSize: 9, color: "#4a5568" }}>{pct.toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent */}
            <div style={styles.sectionTitle}>Recent</div>
            {expenses.slice(0, 5).map(exp => {
              const cat = getCat(exp.category);
              return (
                <div key={exp.id} style={styles.expRow}>
                  <div style={{ ...styles.expIcon, background: `${cat.color}18` }}>
                    <span>{cat.icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.expTitle}>{exp.title}</div>
                    <div style={styles.expDate}>{formatDate(exp.date)} · {cat.label}</div>
                  </div>
                  <div style={{ ...styles.expAmount, color: "#e8eaf0" }}>-{formatINR(exp.amount)}</div>
                </div>
              );
            })}
          </>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <>
            <input
              style={styles.searchBar}
              placeholder="🔍  Search expenses..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            <div style={styles.filterRow}>
              <button style={styles.filterChip(filterCat === "all", "#c8f04a")} onClick={() => setFilterCat("all")}>All</button>
              {CATEGORIES.map(c => (
                <button key={c.id} style={styles.filterChip(filterCat === c.id, c.color)} onClick={() => setFilterCat(c.id)}>
                  {c.icon} {c.label.split(" ")[0]}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 10, letterSpacing: "0.1em" }}>
              {filteredExpenses.length} RESULTS
            </div>

            {filteredExpenses.map(exp => {
              const cat = getCat(exp.category);
              return (
                <div key={exp.id} style={styles.expRow}>
                  <div style={{ ...styles.expIcon, background: `${cat.color}18` }}>{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.expTitle}>{exp.title}</div>
                    <div style={styles.expDate}>
                      {formatDate(exp.date)}
                      {exp.note && <span style={{ color: "#2a3040" }}> · {exp.note}</span>}
                    </div>
                  </div>
                  <div style={{ ...styles.expAmount, color: "#e8eaf0" }}>-{formatINR(exp.amount)}</div>
                  <button style={styles.deleteBtn} onClick={() => deleteExpense(exp.id)}>✕</button>
                </div>
              );
            })}
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <>
            <div style={{ ...styles.card, marginBottom: 16 }}>
              <div style={styles.sectionTitle}>Budget health</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <DonutChart segments={donutSegments} size={90} />
                <div style={{ flex: 1 }}>
                  {topCategories.map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#7a8a60", flex: 1 }}>{c.icon} {c.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{((c.total / totalSpent) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ ...styles.card, marginBottom: 16 }}>
              <div style={styles.sectionTitle}>Category breakdown</div>
              {CATEGORIES.filter(c => categoryTotals[c.id] > 0).sort((a, b) => categoryTotals[b.id] - categoryTotals[a.id]).map(cat => {
                const pct = totalSpent ? (categoryTotals[cat.id] / totalSpent) * 100 : 0;
                const count = expenses.filter(e => e.category === cat.id).length;
                return (
                  <div key={cat.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#c8cad0" }}>{cat.icon} {cat.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{formatINR(categoryTotals[cat.id])}</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 4, transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ fontSize: 9, color: "#4a5568", marginTop: 3 }}>{count} transaction{count !== 1 ? "s" : ""} · {pct.toFixed(1)}% of total</div>
                  </div>
                );
              })}
            </div>

            <div style={styles.grid2}>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Highest spend</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginTop: 2 }}>
                  {getCat(expenses.reduce((a, b) => a.amount > b.amount ? a : b, expenses[0]).category).label}
                </div>
                <div style={{ fontSize: 11, color: "#c8f04a", marginTop: 2 }}>
                  {formatINR(Math.max(...expenses.map(e => e.amount)))}
                </div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Most frequent</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginTop: 2 }}>
                  {topCategories[0]?.label || "—"}
                </div>
                <div style={{ fontSize: 11, color: "#c8f04a", marginTop: 2 }}>
                  {expenses.filter(e => e.category === topCategories[0]?.id).length} times
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav style={styles.nav}>
        {[
          { id: "dashboard", icon: "◈", label: "Overview" },
          { id: "transactions", icon: "≡", label: "Expenses" },
          { id: "analytics", icon: "◎", label: "Analytics" },
        ].map(tab => (
          <button key={tab.id} style={styles.navItem(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={styles.modalTitle}>New Expense</div>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#4a5568", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <label style={styles.label}>What did you spend on?</label>
            <input style={styles.input} placeholder="e.g. Lunch at Haldiram's"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

            <label style={styles.label}>Amount (₹)</label>
            <input style={styles.input} type="number" placeholder="0"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />

            <label style={styles.label}>Category</label>
            <div style={styles.catGrid}>
              {CATEGORIES.map(c => (
                <button key={c.id} style={styles.catBtn(form.category === c.id, c.color)}
                  onClick={() => setForm(f => ({ ...f, category: c.id }))}>
                  <span>{c.icon}</span>
                  <span style={styles.catBtnLabel}>{c.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            <label style={styles.label}>Date</label>
            <input style={styles.input} type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />

            <label style={styles.label}>Note (optional)</label>
            <input style={styles.input} placeholder="Any notes..."
              value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />

            <button style={styles.submitBtn} onClick={addExpense}>Add Expense</button>
          </div>
        </div>
      )}
    </div>
  );
}
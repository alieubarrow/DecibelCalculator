/**
 * App.jsx
 * React UI for the Decibel Calculator.
 * Depends on: decibel.js (globals), styles.css (class names)
 */

const { useState } = React;

// ─── RatioBar ─────────────────────────────────────────────────────────────────
function RatioBar({ ratio }) {
  const pct = ratio <= 0 ? 0 : Math.min(100, (Math.log10(ratio) / 3) * 100);
  const color =
    ratio < 1   ? "#E24B4A" :
    ratio < 2   ? "#1D9E75" :
    ratio < 10  ? "#BA7517" : "#D85A30";

  return (
    <div className="ratio-bar-wrap">
      <div className="ratio-bar-track">
        <div
          className="ratio-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="ratio-bar-labels">
        <span>1× (0 dB)</span>
        <span>10× (10 dB)</span>
        <span>100× (20 dB)</span>
        <span>1000×</span>
      </div>
    </div>
  );
}

// ─── ModeToggle ───────────────────────────────────────────────────────────────
function ModeToggle({ mode, onChange }) {
  const options = [
    { id: "power",    label: "Power / Intensity",  formula: "10·log₁₀(P1/P0)" },
    { id: "pressure", label: "Pressure / Voltage", formula: "20·log₁₀(P1/P0)" },
  ];

  return (
    <div className="mode-toggle">
      {options.map(({ id, label, formula }) => (
        <button
          key={id}
          className={`mode-btn ${mode === id ? "active" : ""}`}
          onClick={() => onChange(id)}
        >
          <div className="mode-label">{label}</div>
          <div className="mode-formula">{formula}</div>
        </button>
      ))}
    </div>
  );
}

// ─── Tab 1: Power Calculator (direct port of C++ main()) ─────────────────────
function PowerTab() {
  const [p0, setP0] = useState("1");
  const [p1, setP1] = useState("2");
  const [mode, setMode] = useState("power");

  const P0 = parseFloat(p0);
  const P1 = parseFloat(p1);
  const valid = P0 > 0 && P1 > 0;

  const db     = valid ? (mode === "power" ? powerToDb(P0, P1) : pressureToDb(P0, P1)) : null;
  const levels = db !== null ? doublingLevels(db) : null;
  const ratio  = valid ? P1 / P0 : null;

  const metrics = db !== null ? [
    { label: "dB change",            value: fmtDb(db) },
    { label: "Power-doubling steps", value: `${fmt(levels)} steps`, note: `÷ ${fmt(LOG2_DB, 4)} (was ÷ 3.0)` },
    { label: "Linear ratio P1 / P0", value: `${fmt(ratio, 4)}×` },
    { label: "Inverse check",        value: `${fmt(mode === "power" ? dbToPowerRatio(db) : dbToPressureRatio(db), 4)}×`, note: "dB → ratio round-trip" },
  ] : [];

  return (
    <div>
      <p className="description">
        Enter two values to compute the dB change — the original program's
        calculation, with input validation and a corrected doubling formula.
      </p>

      <ModeToggle mode={mode} onChange={setMode} />

      <div className="input-grid">
        <div className="input-group">
          <label>P0 — reference {mode === "power" ? "power" : "pressure"}</label>
          <input
            type="number" value={p0} min="0.0001" step="any"
            onChange={e => setP0(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>P1 — new {mode === "power" ? "power" : "pressure"}</label>
          <input
            type="number" value={p1} min="0.0001" step="any"
            onChange={e => setP1(e.target.value)}
          />
        </div>
      </div>

      {!valid && (
        <div className="error-msg">Both values must be greater than zero.</div>
      )}

      {valid && db !== null && (
        <>
          <div className="result-card">
            <div className="result-label">A change from {P0} to {P1} corresponds to</div>
            <div className="result-value" style={{ color: dbColor(db) }}>{fmtDb(db)}</div>
            <div className="result-formula">
              {mode === "power" ? "10" : "20"}·log₁₀({fmt(ratio, 4)}) = {fmt(db, 4)} dB
            </div>
            <RatioBar ratio={ratio} />
          </div>

          <div className="metric-grid">
            {metrics.map(({ label, value, note }) => (
              <div key={label} className="metric-card">
                <div className="metric-label">{label}</div>
                <div className="metric-value">{value}</div>
                {note && <div className="metric-note">{note}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab 2: dB → Ratio (inverse — not in original) ───────────────────────────
function InverseTab() {
  const [db, setDb]   = useState(10);
  const [mode, setMode] = useState("power");

  const ratio  = mode === "power" ? dbToPowerRatio(db) : dbToPressureRatio(db);
  const levels = doublingLevels(db);

  const metrics = [
    { label: "Ratio",                value: `${fmt(ratio, 4)}×` },
    { label: "Power-doubling steps", value: fmt(levels, 2) },
    { label: "Percentage change",    value: `${fmt((ratio - 1) * 100, 1)}%` },
    { label: "Attenuation (1/ratio)",value: `${fmt(1 / ratio, 4)}×` },
  ];

  return (
    <div>
      <p className="description">
        Reverse of the original: given a dB value, find the power or pressure ratio.
      </p>

      <ModeToggle mode={mode} onChange={setMode} />

      <div className="range-row">
        <input
          type="range" min={-60} max={60} step={0.5} value={db}
          onChange={e => setDb(Number(e.target.value))}
        />
        <input
          type="number" className="small" step={0.5} value={db}
          onChange={e => setDb(Number(e.target.value))}
        />
        <span className="range-unit">dB</span>
      </div>

      <div className="result-card">
        <div className="result-label">
          {db >= 0 ? "Increase" : "Decrease"} of {Math.abs(db)} dB ({mode}) =
        </div>
        <div className="result-value" style={{ color: dbColor(db) }}>
          {fmt(ratio, 4)}<span style={{ fontSize: 20 }}>×</span>
        </div>
        <div className="result-formula">
          10^({db} / {mode === "power" ? 10 : 20}) = {fmt(ratio, 6)}
        </div>
        <RatioBar ratio={ratio} />
      </div>

      <div className="metric-grid">
        {metrics.map(({ label, value }) => (
          <div key={label} className="metric-card">
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 3: Reference table ───────────────────────────────────────────────────
function ReferenceTab() {
  const steps = [-20, -10, -6, -3, 0, 3, 6, 10, 20, 30, 40];

  return (
    <div>
      <p className="description">
        Common dB values and their exact power/pressure ratios.
      </p>

      <div className="ref-table">
        <div className="ref-table-header">
          <span>dB</span>
          <span>Power ratio</span>
          <span>Pressure ratio</span>
          <span>Doublings</span>
        </div>
        {steps.map((db, i) => (
          <div key={db} className={`ref-table-row ${db === 0 ? "highlight" : ""}`}>
            <span className="db-col" style={{ color: dbColor(db) }}>
              {db >= 0 ? "+" : ""}{db}
            </span>
            <span className="mono">{fmt(dbToPowerRatio(db), 4)}×</span>
            <span className="mono">{fmt(dbToPressureRatio(db), 4)}×</span>
            <span className="muted">{fmt(doublingLevels(db), 2)}</span>
          </div>
        ))}
      </div>

      <div className="bug-note">
        <div className="bug-title">Bug fixed from original</div>
        <div className="bug-body">
          The original used <code>level = db / 3</code>.
          The correct divisor is <code>10·log₁₀(2) ≈ 3.0103</code>.
          At 30 dB this gives 10.000 vs the correct 9.966 steps — a 0.34%
          error that compounds at higher values.
        </div>
      </div>
    </div>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "power",     label: "Power calculator", icon: "ti-bolt"           },
  { id: "inverse",   label: "dB → ratio",       icon: "ti-arrows-exchange"},
  { id: "reference", label: "Reference table",  icon: "ti-table"          },
];

function App() {
  const [tab, setTab] = useState("power");

  return (
    <div>
      <h1>Decibel Calculator</h1>
      <p className="subtitle">
        JS port of DecibelCalculator.cpp · validation + inverse + pressure mode added
      </p>

      <nav className="tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <i className={`ti ${t.icon}`} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </nav>

      <div role="tabpanel">
        {tab === "power"     && <PowerTab />}
        {tab === "inverse"   && <InverseTab />}
        {tab === "reference" && <ReferenceTab />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

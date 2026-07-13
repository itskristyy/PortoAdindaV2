/**
 * github-contributions.js
 * Fetches GitHub contribution data and renders a contribution heatmap graph.
 * Uses github-contributions-api.jogruber.de (free, no token, CORS-enabled).
 */

const CONTRIB_USERNAME = "itskristyy";
const CONTRIB_CACHE_KEY = "github_contributions_cache";
const CONTRIB_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Color levels matching GitHub's contribution graph
function getContribColor(level, isDark) {
  if (isDark) {
    const colors = [
      "rgba(255,255,255,0.04)",  // level 0 - empty
      "rgba(222,191,194,0.25)",  // level 1 - low
      "rgba(222,191,194,0.45)",  // level 2 - medium-low
      "rgba(222,191,194,0.7)",   // level 3 - medium-high
      "rgba(222,191,194,1)",     // level 4 - high
    ];
    return colors[level] || colors[0];
  } else {
    const colors = [
      "rgba(0,0,0,0.04)",           // level 0
      "rgba(112,88,91,0.2)",        // level 1
      "rgba(112,88,91,0.4)",        // level 2
      "rgba(112,88,91,0.65)",       // level 3
      "rgba(112,88,91,0.9)",        // level 4
    ];
    return colors[level] || colors[0];
  }
}

function getMonthLabel(dateStr) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date(dateStr);
  return months[d.getMonth()];
}

async function fetchContributions() {
  // Check cache
  const cached = localStorage.getItem(CONTRIB_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CONTRIB_CACHE_DURATION) {
      return data;
    }
  }

  try {
    const url = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(CONTRIB_USERNAME)}?y=last`;
    const res = await fetch(url);

    if (!res.ok) {
      if (cached) return JSON.parse(cached).data;
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    const data = json.contributions || [];

    localStorage.setItem(CONTRIB_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data;
  } catch (err) {
    console.error("Error fetching contributions:", err);
    if (cached) return JSON.parse(cached).data;
    return [];
  }
}

function getLastNMonths(contributions, months) {
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  return contributions.filter(c => new Date(c.date) >= cutoff);
}

function buildHeatmapGrid(contributions) {
  // Build a date-lookup map for fast access
  const contribMap = {};
  for (const c of contributions) {
    contribMap[c.date] = c;
  }

  // Determine the date range: from the first contribution to today
  const sorted = [...contributions].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length === 0) return { weeks: [], monthLabels: [] };

  const firstDate = new Date(sorted[0].date);
  const today = new Date();

  // Start from the Sunday of the first contribution's week
  const gridStart = new Date(firstDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  // End at the Saturday of the current week
  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  // Helper to format date as YYYY-MM-DD
  function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const weeks = [];
  const monthLabels = [];
  let lastMonth = -1;
  let cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week = [];
    let weekMonthLabel = null;
    for (let d = 0; d < 7; d++) {
      const dateStr = fmtDate(cursor);
      const entry = contribMap[dateStr] || null;
      week.push(entry);

      // Detect month transition on any day of the week
      const m = cursor.getMonth();
      if (m !== lastMonth) {
        // Place the label at this week's column index
        if (!weekMonthLabel) {
          const months = ["Jan","Feb","Mar","Apr","May","Jun",
                          "Jul","Aug","Sep","Oct","Nov","Dec"];
          weekMonthLabel = { weekIndex: weeks.length, label: months[m].toUpperCase() };
        }
        lastMonth = m;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    if (weekMonthLabel) {
      monthLabels.push(weekMonthLabel);
    }
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

function renderContributionGraph(contributions) {
  const container = document.getElementById("contrib-graph");
  if (!container) return;

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  // Last 6 months of data
  const filtered = getLastNMonths(contributions, 6);
  const totalContribs = filtered.reduce((sum, c) => sum + c.count, 0);

  const { weeks, monthLabels } = buildHeatmapGrid(filtered);

  // Count
  const countEl = document.getElementById("contrib-count");
  if (countEl) {
    countEl.textContent = `${totalContribs} contributions in the last 6 months`;
  }

  // Clear
  container.innerHTML = "";

  // Month labels row
  const monthRow = document.createElement("div");
  monthRow.className = "contrib-months";
  // Calculate grid dimensions dynamically based on container width
  const totalWeeks = weeks.length;
  const cellGap = 3;
  const containerWidth = container.clientWidth;
  // Calculate cell size to fill the container
  const cellSize = Math.floor((containerWidth - (totalWeeks - 1) * cellGap) / totalWeeks);
  const colWidth = cellSize + cellGap;

  for (const ml of monthLabels) {
    const span = document.createElement("span");
    span.className = "contrib-month-label";
    span.textContent = ml.label;
    // Position label at the exact pixel offset of the week column
    const pct = (ml.weekIndex / totalWeeks) * 100;
    span.style.left = `${pct}%`;
    monthRow.appendChild(span);
  }
  container.appendChild(monthRow);

  // Grid
  const grid = document.createElement("div");
  grid.className = "contrib-grid";
  grid.style.gridTemplateColumns = `repeat(${totalWeeks}, 1fr)`;

  // Render columns (each column = one week, 7 rows)
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < totalWeeks; col++) {
      const cell = document.createElement("div");
      cell.className = "contrib-cell";
      const entry = weeks[col] && weeks[col][row];
      if (entry) {
        const level = entry.level || 0;
        cell.style.backgroundColor = getContribColor(level, isDark);
        cell.setAttribute("data-level", level);
        cell.title = `${entry.count} contribution${entry.count !== 1 ? 's' : ''} on ${entry.date}`;
      } else {
        cell.style.backgroundColor = "transparent";
        cell.classList.add("contrib-cell--empty");
      }
      grid.appendChild(cell);
    }
  }

  container.appendChild(grid);

  // Legend
  const legend = document.createElement("div");
  legend.className = "contrib-legend";
  legend.innerHTML = `<span class="contrib-legend-text">Less</span>`;
  for (let i = 0; i <= 4; i++) {
    const box = document.createElement("div");
    box.className = "contrib-legend-box";
    box.style.backgroundColor = getContribColor(i, isDark);
    if (i === 0) box.style.border = `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`;
    legend.appendChild(box);
  }
  legend.innerHTML += `<span class="contrib-legend-text">More</span>`;
  container.appendChild(legend);
}

// Also render monthly bar chart
function renderMonthlyChart(contributions) {
  const chartContainer = document.getElementById("monthly-chart");
  if (!chartContainer) return;

  const now = new Date();
  const monthsBack = 12;
  const monthlyData = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    monthlyData.push({
      key,
      label: monthNames[d.getMonth()],
      year: d.getFullYear(),
      total: 0
    });
  }

  // Aggregate
  for (const entry of contributions) {
    const key = entry.date.slice(0, 7);
    const found = monthlyData.find(m => m.key === key);
    if (found) found.total += entry.count;
  }

  const maxVal = Math.max(...monthlyData.map(m => m.total), 1);

  chartContainer.innerHTML = "";

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  for (const month of monthlyData) {
    const col = document.createElement("div");
    col.className = "monthly-bar-col";

    const value = document.createElement("span");
    value.className = "monthly-bar-value";
    value.textContent = month.total;

    const barWrap = document.createElement("div");
    barWrap.className = "monthly-bar-track";

    const bar = document.createElement("div");
    bar.className = "monthly-bar-fill";
    const pct = (month.total / maxVal) * 100;
    bar.style.height = "0%";
    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.height = `${Math.max(pct, 2)}%`;
      });
    });

    barWrap.appendChild(bar);

    const label = document.createElement("span");
    label.className = "monthly-bar-label";
    label.textContent = month.label;

    col.appendChild(value);
    col.appendChild(barWrap);
    col.appendChild(label);
    chartContainer.appendChild(col);
  }
}

// Initialize
async function initContributions() {
  const contributions = await fetchContributions();
  if (contributions.length === 0) return;

  renderContributionGraph(contributions);
  renderMonthlyChart(contributions);

  // Re-render on theme change
  const observer = new MutationObserver(() => {
    renderContributionGraph(contributions);
    renderMonthlyChart(contributions);
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initContributions);
} else {
  initContributions();
}

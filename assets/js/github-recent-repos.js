// github-recent-repos.js
// Fetches and displays recent GitHub repositories for the user.

const RECENT_REPOS_USERNAME = "itskristyy";
const RECENT_REPOS_CACHE_KEY = "github_recent_repos_cache";
const RECENT_REPOS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const RECENT_REPOS_COUNT = 6; // number of repos to display

/**
 * Fetch recent repositories (sorted by recent push) from GitHub API.
 * Uses localStorage for caching to avoid rate limits.
 */
async function fetchRecentRepos() {
  const cached = localStorage.getItem(RECENT_REPOS_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < RECENT_REPOS_CACHE_DURATION) {
      return data;
    }
  }
  const url = `https://api.github.com/users/${encodeURIComponent(RECENT_REPOS_USERNAME)}/repos?sort=pushed&direction=desc&per_page=${RECENT_REPOS_COUNT}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (cached) return JSON.parse(cached).data;
      throw new Error(`HTTP ${res.status}`);
    }
    const repos = await res.json();
    const data = repos.map(r => ({ name: r.name, html_url: r.html_url, description: r.description }));
    localStorage.setItem(RECENT_REPOS_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (err) {
    console.error("Error fetching recent repos:", err);
    if (cached) return JSON.parse(cached).data;
    return [];
  }
}

/** Render the list of recent repositories into the placeholder element. */
function renderRecentRepos(repos) {
  const listEl = document.getElementById("recent-repos-list");
  if (!listEl) return;
  listEl.innerHTML = "";
  if (repos.length === 0) {
    listEl.textContent = "No repositories found.";
    return;
  }
  repos.forEach(repo => {
    const item = document.createElement("div");
    item.className = "recent-repo-item";
    const link = document.createElement("a");
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = repo.name;
    item.appendChild(link);
    if (repo.description) {
      const desc = document.createElement("p");
      desc.className = "recent-repo-desc";
      desc.textContent = repo.description;
      item.appendChild(desc);
    }
    listEl.appendChild(item);
  });
}

/** Initialise recent‑repos component after DOM is ready. */
async function initRecentRepos() {
  const repos = await fetchRecentRepos();
  renderRecentRepos(repos);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRecentRepos);
} else {
  initRecentRepos();
}

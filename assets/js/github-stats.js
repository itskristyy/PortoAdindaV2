const githubUsername = "itskristyy";
const CACHE_KEY = "github_stats_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 1 jam (ms)

async function fetchGitHubStats() {
  const reposEl = document.getElementById('github-repos');
  const followersEl = document.getElementById('github-followers');
  const followingEl = document.getElementById('github-following');

  // 1. Cek cache dulu
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      renderStats(data);
      return; // Pakai data cache, TIDAK fetch ke API
    }
  }

  // 2. Kalau cache kosong/expired, fetch baru (TANPA token, karena public data)
  try {
    const response = await fetch(`https://api.github.com/users/${githubUsername}`);

    if (response.status === 403) {
      // Rate limit kena — pakai cache lama kalau ada, meski sudah expired
      if (cached) {
        renderStats(JSON.parse(cached).data);
      } else {
        console.warn("Rate limit exceeded, no cache available.");
      }
      return;
    }

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Simpan ke cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    renderStats(data);
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    // Fallback ke cache lama kalau fetch gagal total
    if (cached) renderStats(JSON.parse(cached).data);
  }

  function renderStats(data) {
    if (reposEl) reposEl.textContent = data.public_repos;
    if (followersEl) followersEl.textContent = data.followers;
    if (followingEl) followingEl.textContent = data.following;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchGitHubStats);
} else {
  fetchGitHubStats();
}
// API Endpoint: https://api.github.com/users/itskristyy

const apiUrl = "https://api.github.com/users/itskristyy";

async function fetchGitHubStats() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    const reposEl = document.getElementById('github-repos');
    const followersEl = document.getElementById('github-followers');
    const followingEl = document.getElementById('github-following');

    if (reposEl) reposEl.textContent = data.public_repos;
    if (followersEl) followersEl.textContent = data.followers;
    if (followingEl) followingEl.textContent = data.following;
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchGitHubStats);
} else {
  fetchGitHubStats();
}
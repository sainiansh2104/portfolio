(function () {
  const themeToggle = document.querySelector(".theme-toggle");
  const yearEl = document.getElementById("copyright-year");
  const sectionIds = ["about", "skills", "projects"];
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const storageKey = "profile-theme";

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("theme-dark", isDark);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.textContent = isDark ? "Use light theme" : "Use dark theme";
    }
  }

  function preferredTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  applyTheme(preferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = document.body.classList.contains("theme-dark")
        ? "light"
        : "dark";
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const sections = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          const id = entry.target.id;
          navLinks.forEach(function (link) {
            const isCurrent = link.getAttribute("href") === "#" + id;
            if (isCurrent) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
})();

console.log("JavaScript connected");

// Search by project title, description, or technology.
const projectSearch = document.getElementById("projectSearch");
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const projectSearchStatus = document.getElementById("projectSearchStatus");
const noProjectsMessage = document.getElementById("noProjectsMessage");

function filterProjects() {
  const query = projectSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const searchableText = `${card.textContent} ${card.dataset.search || ""}`.toLowerCase();
    const matches = searchableText.includes(query);
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  projectSearchStatus.textContent = query
    ? `Showing ${visibleCount} of ${projectCards.length} projects for "${projectSearch.value.trim()}".`
    : `Showing all ${projectCards.length} projects.`;
  noProjectsMessage.hidden = visibleCount !== 0;
}

projectSearch.addEventListener("input", filterProjects);

const cityInput = document.getElementById("cityInput");
const weatherButton = document.getElementById("weatherButton");
const weatherResult = document.getElementById("weatherResult");

async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    weatherResult.textContent = "Please enter a city name.";
    return;
  }
  weatherResult.textContent = "Loading weather...";
  weatherButton.disabled = true;
  try {
    const weatherApiKey = "861c12f381de9ae2f048ee8e4d49a18f";
    const url =
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${weatherApiKey
      }& units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 404) throw new Error("City not found. Check the spelling.");
      if (response.status === 401) throw new Error("API key is invalid or not active yet.");
      if (response.status === 429) throw new Error("Too many requests. Please wait and retry.");
      throw new Error(`Weather service error(${response.status}).`);
    }
    weatherResult.textContent = `${data.name}: ${data.main.temp}°C,
${data.weather[0].description}.Humidity: ${data.main.humidity}%.`;
  } catch (error) {
    weatherResult.textContent = error instanceof TypeError
      ? "Network error. Check your internet connection."
      : error.message;
    console.error("Weather error:", error);
  } finally {
    weatherButton.disabled = false;
  }
}
weatherButton.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") getWeather();
});
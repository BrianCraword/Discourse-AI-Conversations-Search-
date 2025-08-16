import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.12.1", (api) => {
  // Exact URL format requested (no expanded UI)
  const URL_TMPL = "/search?q=keywords%20in%3Amessages";
  // Mount only in the AI Conversations sidebars (list + single chat)
  const PANEL_SELECTOR = ".sidebar-sections.ai-conversations-panel";
  const BOX_ID = "ai-chats-search";

  function allowedUser() {
    const u = api.getCurrentUser?.();
    if (!u) return false;              // guests: hidden
    if (u.staff) return true;          // staff always allowed
    return (u.trust_level || 0) >= 1;  // TL1+
  }

  function buildForm() {
    const form = document.createElement("form");
    form.id = BOX_ID;
    form.className = "ai-chats-search";
    form.setAttribute("role", "search");
    form.innerHTML = `
      <label class="ai-chats-label" for="ai-chats-term">Search chats</label>
      <div class="ai-chats-row">
        <input id="ai-chats-term" class="ai-chats-input" type="text"
               placeholder="Type to search your messages…" autocomplete="off" />
        <button class="ai-chats-btn" type="submit" title="Search">🔎</button>
      </div>
    `;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = (form.querySelector("#ai-chats-term").value || "").trim();
      if (!raw) {
        window.location.assign("/search?q=in%3Amessages");
        return;
      }
      const url = URL_TMPL.replace("keywords", encodeURIComponent(raw));
      window.location.assign(url);
    });
    return form;
  }

  function pruneIfOutOfScope() {
    // Remove if user downgraded or panel not present
    document.querySelectorAll(`#${BOX_ID}`).forEach((node) => {
      if (!allowedUser() || !node.closest(PANEL_SELECTOR)) node.remove();
    });
  }

  function mountAll() {
    pruneIfOutOfScope();
    if (!allowedUser()) return;

    document.querySelectorAll(PANEL_SELECTOR).forEach((panel) => {
      if (panel.querySelector(`#${BOX_ID}`)) return;
      panel.prepend(buildForm()); // place at top of the AI panel
    });
  }

  api.onPageChange(mountAll);
  document.addEventListener("DOMContentLoaded", mountAll);

  // Handle sidebar re-renders
  const obs = new MutationObserver(mountAll);
  obs.observe(document.documentElement, { childList: true, subtree: true });
});

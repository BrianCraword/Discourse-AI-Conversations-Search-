import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.12.1", (api) => {
  const URL_TMPL = "/search?q=keywords%20in%3Amessages";
  const PANEL_SELECTOR = ".sidebar-sections.ai-conversations-panel"; // AI sidebars only
  const BOX_ID = "ai-chats-search";

  function allowedUser() {
    const u = api.getCurrentUser?.();
    if (!u) return false;             // guest
    if (u.staff) return true;         // staff always allowed
    return (u.trust_level || 0) >= 1; // TL1+
  }

  function buildForm() {
    const form = document.createElement("form");
    form.id = BOX_ID;
    form.className = "ai-chats-search";
    form.setAttribute("role", "search");
    form.innerHTML = `
      <label class="ai-chats-label" for="ai-chats-term">AI Messages</label>
      <div class="ai-chats-row">
        <input id="ai-chats-term" class="ai-chats-input" type="text"
               placeholder="Search…" autocomplete="off" />
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

  function removeStrays() {
    document.querySelectorAll(`#${BOX_ID}`).forEach((node) => {
      if (!allowedUser() || !node.closest(PANEL_SELECTOR)) node.remove();
    });
  }

  function mountAll() {
    removeStrays();
    if (!allowedUser()) return;

    document.querySelectorAll(PANEL_SELECTOR).forEach((panel) => {
      if (panel.querySelector(`#${BOX_ID}`)) return;
      panel.prepend(buildForm()); // top of the AI panel
    });
  }

  api.onPageChange(mountAll);
  document.addEventListener("DOMContentLoaded", mountAll);

  // Catch sidebar re-renders
  const obs = new MutationObserver(mountAll);
  obs.observe(document.documentElement, { childList: true, subtree: true });
});

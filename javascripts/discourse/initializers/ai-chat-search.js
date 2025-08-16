// javascripts/discourse/initializers/ai-chat-search.js
import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.12.1", (api) => {
  // Exact URL format you asked for (no expanded UI)
  const URL_TMPL = "/search?q=keywords%20in%3Amessages";
  // Mount only inside the AI Conversations sidebars (list + single chat)
  const PANEL_SELECTOR = ".sidebar-sections.ai-conversations-panel";
  const BOX_ID = "ai-chats-search";

  // Show to logged-in TL1+ (staff always allowed)
  function allowedUser() {
    const u = api.getCurrentUser?.();
    if (!u) return false;              // guest
    if (u.staff) return true;          // staff bypass
    return (u.trust_level || 0) >= 1;  // TL1+
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
               placeholder="Search…" autocomplete="off" aria-label="Search messages"/>
        <button class="ai-chats-btn" type="submit" title="Search" aria-label="Search">🔎</button>
      </div>
    `;

    // ---- Bullet-proof inline styles (survive any site CSS) ----
    // outer "card" container
    form.style.cssText =
      "display:block;margin:4px 6px 10px;box-sizing:border-box;" +
      "background:#fff;border:1px solid var(--vc-border,#e6e6e6);" +
      "border-radius:12px;box-shadow:0 1px 0 rgba(0,0,0,.02);padding:0";

    // label (kept simple, readable)
    const label = form.querySelector(".ai-chats-label");
    label.style.cssText =
      "display:block;font-weight:700;margin:8px 10px 6px;color:var(--vc-text,#222)";

    // row: single line (grid is most robust across themes)
    const row = form.querySelector(".ai-chats-row");
    row.style.cssText =
      "display:grid;grid-template-columns:1fr 40px;column-gap:6px;" +
      "align-items:center;margin:0 8px 8px";

    // input
    const input = form.querySelector(".ai-chats-input");
    input.style.cssText =
      "min-width:0;width:100%;box-sizing:border-box;height:36px;" +
      "padding:8px 10px;border:1px solid var(--vc-border,#e6e6e6);" +
      "border-radius:8px;background:#fff";

    // button
    const btn = form.querySelector(".ai-chats-btn");
    btn.style.cssText =
      "width:40px;height:36px;display:grid;place-items:center;" +
      "box-sizing:border-box;border:1px solid var(--vc-border,#e6e6e6);" +
      "border-radius:8px;padding:0;background:var(--primary-very-low,#f6f6f6);" +
      "cursor:pointer;font-size:18px;line-height:1";

    // ---- Submit → /search?q=<term>%20in%3Amessages ----
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = (input.value || "").trim();
      if (!raw) {
        window.location.assign("/search?q=in%3Amessages");
        return;
      }
      const url = URL_TMPL.replace("keywords", encodeURIComponent(raw));
      window.location.assign(url);
    });

    return form;
  }

  function pruneOutOfScope() {
    // Remove any stray copies if user state or DOM changed
    document.querySelectorAll(`#${BOX_ID}`).forEach((node) => {
      if (!allowedUser() || !node.closest(PANEL_SELECTOR)) node.remove();
    });
  }

  function mountAll() {
    pruneOutOfScope();
    if (!allowedUser()) return;

    const panels = document.querySelectorAll(PANEL_SELECTOR);
    if (!panels.length) return;

    panels.forEach((panel) => {
      if (!panel.querySelector(`#${BOX_ID}`)) {
        panel.prepend(buildForm()); // top of the AI panel
      }
    });
  }

  // Run on navigation and initial load
  api.onPageChange(mountAll);
  document.addEventListener("DOMContentLoaded", mountAll);

  // React to sidebar re-renders
  new MutationObserver(mountAll).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});

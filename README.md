# AI Chat Search (Discourse AI Conversations)

A tiny theme component that adds a **“Search chats”** box to the AI Conversations sidebars and routes to:
/search?q=<keywords> in:messages

markdown
Copy code
(no expanded UI).

## What it does
- Shows only in sidebars containing the AI Conversations panel (main list + single chat).
- Visible to **logged-in users with Trust Level ≥ 1** (staff always allowed).
- Navigates to `/search?q=<term>%20in%3Amessages`.
- Self-contained styling for the search box (no site-wide visual changes).

## Requirements
- Discourse **3.2+**.
- The AI Conversations sidebar must include the container class:
.sidebar-sections.ai-conversations-panel

markdown
Copy code
(This is present in the Discourse AI Conversations UI. If your markup differs, adjust `PANEL_SELECTOR` in `ai-chat-search.js`.)

## Install
1. Go to **Admin → Customize → Themes → Install**.
2. Choose **From a git repo**, enter your Git URL, and install.
3. Add as a **component** to your active theme(s).

## Settings
No settings. Logic is intentionally simple:
- PM filter token is `in:messages`.
- Min trust level is TL1.
- Scope is `.sidebar-sections.ai-conversations-panel`.

If you need options (e.g., TL0 or `in:personal`), open an issue or fork and tweak:
- `allowedUser()` and/or
- `URL_TMPL` / fallback URL in the initializer.

## Notes
- This component **does not** hide “New Topic” or restyle sidebars. Keep those in your site’s separate style component.
- CSS references your site’s palette via safe fallbacks:
- `var(--vc-border, #e6e6e6)`
- `var(--vc-orange, #ff7a00)`
- `var(--vc-shadow, 0 1px 0 rgba(0,0,0,.02))`

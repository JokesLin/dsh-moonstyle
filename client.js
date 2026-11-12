// dsh-moonstyle — browser half. MIT licensed.
//
// A moonlight palette with four controls, registered as one extra row in
// Settings -> General, directly under the shell's own Appearance row.
//
// THE CONTROLS
//   Message shape  bubble | conversation — the shape of YOUR OWN messages.
//   Palette        moonlight | stock     — this palette, or whatever is under it.
//   Sidebar chrome full | minimal        — minimal blanks the sidebar's brand
//                                          block entirely and drops the account
//                                          row's avatar + name, replacing that
//                                          row with a small gear that still
//                                          opens the menu.
//   Ink weight     body, sidebar 0..100  — how heavy text sits, two sliders so
//                                          the conversation and the chrome can
//                                          differ. Written as a text-stroke so
//                                          intermediate values exist at all:
//                                          only some system fonts are variable,
//                                          PingFang and friends snap font-weight
//                                          to 400/500/600.
//
// PREFERENCES LIVE IN localStorage, PER BROWSER.
//   Key `dsh-moonstyle:prefs`. Not a Host settings namespace on purpose: that
//   would mean a Config schema in index.js, a settings contract, and a
//   migration story, all for four cosmetic values. The cost is real: these
//   do NOT sync across devices, while ui-theme's light/dark/system does.
//
// WHY !important INSTEAD OF ctx.theme.overrideTokens()
//   ds-bot also stacks a token layer and re-stacks it on every roster change,
//   so its layer always lands above ours. A token layer here would be silently
//   outranked — the palette switch and the slider would move nothing at all.
//   CSS declarations marked !important outrank inline style, which is how
//   ui-layout and ds-bot both write tokens, so a stylesheet takes authority
//   back. Fonts stay on overrideTokens precisely BECAUSE they must remain
//   overwritable by ui-theme's own font settings.
//
// "STOCK" IS A PAINT, NOT AN ABSENCE
//   Turning this palette off cannot mean "stop painting": ds-bot's layer keeps
//   writing moonlight values into body's inline style, so an absent sheet would
//   leave the shell moonlight. The stock branch therefore writes the shell's
//   own token definitions back, with the same !important authority. See STOCK.
//
// WHAT THE PALETTE SWITCH CANNOT REACH
//   ds-bot paints its own components from --bt-* values computed inside its
//   bundle. On "stock" those stay moonlight, so ds-bot's own chrome keeps its
//   colours while the DSH shell around it goes native. Nothing here can fix
//   that; ds-bot would have to be told to follow.
//
// TYPE IS NOT PART OF THE PALETTE SWITCH
//   The rounded stack and the 0.18px stroke apply to both palettes. They are
//   the "lite" part of the package, not a colour.

window.__ModuleLoader__.load({
	id: "dsh-moonstyle",
	factory: (require) => {
		const React = require("react");
		const h = React.createElement;

		const exports = {};
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		// --- Type ----------------------------------------------------------------
		const FONT_ROUNDED =
			'"SF Pro Rounded", ui-rounded, "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
		const FONT_STOCK =
			'-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
		/** Stroke at ink weight 100; the default weight 40 lands on 0.18px. */
		const STROKE_MAX = 0.45;

		/**
		 * Sidebar title length, in characters, and the range the slider offers.
		 * One `em` is one CJK glyph at the row's font size, so the cap is written
		 * as `max-width: Nem`. The ceiling is 12 because that is what the host
		 * title plugin is configured to allow (36 UTF-8 bytes) — a slider that
		 * reaches past it would only show empty range.
		 */
		const TITLE_CHARS_MIN = 4;
		const TITLE_CHARS_MAX = 12;

		// --- The card ------------------------------------------------------------
		// The only place raw colours are written down.
		const MOON = {
			light: {
				bg: "#f7f9fc",
				sidebar: "#eef2f8",
				bubble: "#e5ebf5",
				bubbleHi: "#d8e2f2",
				card: "#ffffff",
				code: "#f1f4fa",
				text: "#121826",
				// The user's own bubble: deep indigo with white ink, as ds-bot has it.
				user: "#1e3a8a",
				userInk: "#ffffff",
				// The assistant panel: a step paler than the user-side surfaces so the
				// reply never reads as the same colour as anything on your side.
				assistant: "#eef1f8",
			},
			dark: {
				bg: "#0b1020",
				sidebar: "#10172a",
				bubble: "#1a2340",
				bubbleHi: "#232f52",
				card: "#141c33",
				code: "#141c33",
				text: "#e8edf7",
				user: "#3b6fd8",
				userInk: "#ffffff",
				// Darker than the reply-side surfaces, close to `sidebar`: on a dark
				// scheme "paler" means *lower* contrast against the canvas.
				assistant: "#161e35",
			},
		};

		/** `rgba()` from a hex colour plus an alpha. */
		const ink = (hex, alpha) => {
			const n = parseInt(hex.slice(1), 16);
			return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
		};

		/**
		 * The palette as two columns of [token, value] pairs. `sidebar` arrives
		 * already mixed, because it depends on the slider.
		 */
		/**
		 * The palette as two columns of [token, value] pairs.
		 *
		 * The sidebar is a fixed pair, not a slider: this package matches ds-bot's
		 * moonlight card value for value, and ds-bot keeps the sidebar at
		 * #eef2f8 / #10172a regardless of anything else.
		 */
		function paletteTokens() {
			const column = (M) => [
				// --- surfaces
				["--dsw-alias-bg-base", M.bg],
				["--dsw-specific-sidebar-fill", M.sidebar],
				// The user's bubble. ds-bot paints this deep indigo, not the shell's
				// near-white `specific-bubble`, and pairs it with white ink.
				["--dsw-specific-bubble", M.user],
				["--dsw-specific-bubble-highlight", M.user],
				["--dsw-alias-bg-layer-1", M.card],
				["--dsw-alias-bg-layer-2", M.card],
				["--dsw-alias-bg-layer-3", M.card],
				["--dsw-alias-bg-module-platform", M.sidebar],
				["--dsw-specific-input-major", M.bg],
				// --- interactive fills
				["--dsw-alias-interactive-bg-hover", ink(M.text, 0.06)],
				["--dsw-alias-interactive-bg-active", ink(M.text, 0.1)],
				["--dsw-alias-interactive-bg-hover-solid", M.sidebar],
				["--dsw-specific-sidebar-nav-item-hover", ink(M.text, 0.06)],
				["--dsw-specific-sidebar-nav-item-active", M.bubble],
				// --- inks
				["--dsw-alias-label-primary", M.text],
				["--dsw-alias-label-secondary", ink(M.text, 0.74)],
				["--dsw-alias-label-tertiary", ink(M.text, 0.6)],
				// --- borders
				["--dsw-alias-border-l1", ink(M.text, 0.04)],
				["--dsw-alias-border-l2", ink(M.text, 0.1)],
				["--dsw-alias-border-l3", ink(M.text, 0.12)],
				["--dsw-alias-border-l4", ink(M.text, 0.16)],
				// --- code
				["--dsw-alias-markdown-code-block", M.code],
				// --- layout seats (not shell tokens; read only by layoutCss)
				["--dml-user-ink", M.userInk],
				["--dml-assistant-bg", M.assistant],
			];
			return { light: column(MOON.light), dark: column(MOON.dark) };
		}

		/**
		 * The shell's own definitions for the same tokens, per scheme.
		 *
		 * "Stock" cannot simply stop painting: ds-bot's token layer keeps writing
		 * moonlight values into body's inline style, so an absent sheet would leave
		 * the shell moonlight. Writing the shell's definitions back with the same
		 * !important authority is what makes the switch real.
		 *
		 * Values reference the shell's own static scale rather than spelling out hex,
		 * so a future palette change in the shell flows through here for free.
		 */
		const STOCK = {
			light: [
				["--dsw-alias-bg-base", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-specific-sidebar-fill", "var(--dsw-static-neutral-bluish-50)"],
				["--dsw-specific-bubble", "var(--dsw-static-deepseek-50)"],
				["--dsw-specific-bubble-highlight", "var(--dsw-static-deepseek-200)"],
				["--dsw-alias-bg-layer-1", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-alias-bg-layer-2", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-alias-bg-layer-3", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-alias-bg-module-platform", "var(--dsw-static-neutral-bluish-60)"],
				["--dsw-specific-input-major", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-alias-interactive-bg-hover", "#2631480f"],
				["--dsw-alias-interactive-bg-active", "#2631481a"],
				["--dsw-alias-interactive-bg-hover-solid", "var(--dsw-static-neutral-bluish-75)"],
				["--dsw-specific-sidebar-nav-item-hover", "var(--dsw-static-neutral-bluish-75)"],
				["--dsw-specific-sidebar-nav-item-active", "var(--dsw-static-neutral-bluish-100)"],
				["--dsw-alias-label-primary", "var(--dsw-static-neutral-bluish-1000)"],
				["--dsw-alias-label-secondary", "var(--dsw-static-neutral-bluish-700)"],
				["--dsw-alias-label-tertiary", "var(--dsw-static-neutral-bluish-600)"],
				["--dsw-alias-border-l1", "#0000000a"],
				["--dsw-alias-border-l2", "#0000001a"],
				["--dsw-alias-border-l3", "#0000001f"],
				["--dsw-alias-border-l4", "#00000029"],
				["--dsw-alias-markdown-code-block", "var(--dsw-static-neutral-bluish-50)"],
				// Layout seats: on stock the shell has no indigo user bubble, so the
				// user's own bubble keeps stock ink. The assistant panel goes neutral
				// — NOT `--dsw-specific-bubble` (deepseek-50), which is what the user
				// bubble itself is painted with here; sharing it would make both
				// sides of the conversation the same colour.
				["--dml-user-ink", "var(--dsw-static-neutral-bluish-1000)"],
				["--dml-assistant-bg", "var(--dsw-static-neutral-bluish-50)"],
			],
			dark: [
				["--dsw-alias-bg-base", "var(--dsw-static-neutral-bluish-950)"],
				["--dsw-specific-sidebar-fill", "var(--dsw-static-neutral-bluish-900)"],
				["--dsw-specific-bubble", "var(--dsw-static-neutral-bluish-850)"],
				["--dsw-specific-bubble-highlight", "var(--dsw-static-neutral-bluish-750)"],
				["--dsw-alias-bg-layer-1", "var(--dsw-static-neutral-bluish-875)"],
				["--dsw-alias-bg-layer-2", "var(--dsw-static-neutral-bluish-850)"],
				["--dsw-alias-bg-layer-3", "var(--dsw-static-neutral-bluish-800)"],
				["--dsw-alias-bg-module-platform", "var(--dsw-static-neutral-bluish-800)"],
				["--dsw-specific-input-major", "var(--dsw-static-neutral-bluish-850)"],
				["--dsw-alias-interactive-bg-hover", "#ffffff14"],
				["--dsw-alias-interactive-bg-active", "#ffffff24"],
				["--dsw-alias-interactive-bg-hover-solid", "var(--dsw-static-neutral-bluish-800)"],
				["--dsw-specific-sidebar-nav-item-hover", "var(--dsw-static-neutral-bluish-850)"],
				["--dsw-specific-sidebar-nav-item-active", "var(--dsw-static-neutral-bluish-750)"],
				["--dsw-alias-label-primary", "var(--dsw-static-neutral-bluish-50)"],
				["--dsw-alias-label-secondary", "var(--dsw-static-neutral-bluish-300)"],
				["--dsw-alias-label-tertiary", "var(--dsw-static-neutral-bluish-400)"],
				["--dsw-alias-border-l1", "#ffffff0f"],
				["--dsw-alias-border-l2", "#ffffff1f"],
				["--dsw-alias-border-l3", "#ffffff29"],
				["--dsw-alias-border-l4", "#fff3"],
				["--dsw-alias-markdown-code-block", "var(--dsw-static-neutral-bluish-900)"],
				["--dml-user-ink", "var(--dsw-static-neutral-bluish-50)"],
				["--dml-assistant-bg", "var(--dsw-static-neutral-bluish-900)"],
			],
		};

		// --- Preferences ---------------------------------------------------------
		const PREFS_KEY = "dsh-moonstyle:prefs";
		// Pre-rename key: read once so renaming the package does not silently
		// reset the three toggles. The next write lands on PREFS_KEY.
		const LEGACY_PREFS_KEY = "dsh-mint-lite:prefs";
		const DEFAULTS = Object.freeze({
			layout: "bubble",
			palette: "moonlight",
			chrome: "full",
			weightBody: 40,
			weightSidebar: 40,
			titleChars: 9,
			rowTime: "hide",
		});

		/** Ink weight is a percentage; anything else in storage falls back to 40. */
		function clampWeight(raw) {
			return clampNumber(raw, 0, 100, 40);
		}

		/** Rounded, clamped number; `fallback` when storage holds something else. */
		function clampNumber(raw, min, max, fallback) {
			const n = typeof raw === "number" ? raw : Number(raw);
			if (!Number.isFinite(n)) return fallback;
			return Math.min(max, Math.max(min, Math.round(n)));
		}

		function normalize(raw) {
			const value = raw !== null && typeof raw === "object" ? raw : {};
			return {
				layout: value.layout === "flat" ? "flat" : "bubble",
				palette: value.palette === "stock" ? "stock" : "moonlight",
				chrome: value.chrome === "minimal" ? "minimal" : "full",
				// `weight` is the single-slider shape this pref had in 1.5.0; it seeds
				// the body slider so an upgrade keeps whatever thickness was chosen.
				weightBody: clampWeight(value.weightBody ?? value.weight),
				weightSidebar: clampWeight(value.weightSidebar),
				titleChars: clampNumber(value.titleChars, TITLE_CHARS_MIN, TITLE_CHARS_MAX, 9),
				// Hiding the resting timestamp is the default: an idle row says
				// nothing, a running or waiting row still says what it is doing.
				rowTime: value.rowTime === "show" ? "show" : "hide",
			};
		}

		function readPrefs() {
			try {
				const raw =
					window.localStorage.getItem(PREFS_KEY) ??
					window.localStorage.getItem(LEGACY_PREFS_KEY);
				return normalize(JSON.parse(raw ?? "null"));
			} catch {
				return { ...DEFAULTS };
			}
		}

		let prefs = readPrefs();
		const listeners = new Set();

		/** A fresh object each read, so React sees a new reference. */
		function getPrefs() {
			return { ...prefs };
		}

		function update(patch) {
			prefs = normalize({ ...prefs, ...patch });
			try {
				window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
			} catch {
				// Full or blocked storage: the in-memory value still applies.
			}
			paint();
			for (const listener of listeners) listener(getPrefs());
		}

		function subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}

		// --- Stylesheet ----------------------------------------------------------
		const STYLE_ID = "dsh-moonstyle-theme";

		const declarations = (pairs) =>
			pairs.map(([name, value]) => name + ":" + value + " !important").join(";");

		/**
		 * Palette block. Both branches paint — see the STOCK note: on the stock
		 * palette the shell's own definitions are written back, because otherwise
		 * ds-bot's layer would keep the shell moonlight.
		 */
		function paletteCss(current) {
			if (current.palette === "stock") {
				return [
					"body:not([data-ds-dark-theme]){" + declarations(STOCK.light) + "}",
					"body[data-ds-dark-theme]{" + declarations(STOCK.dark) + "}",
				].join("\n");
			}
			const tokens = paletteTokens();
			return [
				"body:not([data-ds-dark-theme]){" + declarations(tokens.light) + "}",
				"body[data-ds-dark-theme]{" + declarations(tokens.dark) + "}",
			].join("\n");
		}

		/**
		 * Message shape, matched to ds-bot's model rather than the shell's:
		 *
		 *   BUBBLE   your message = deep indigo panel, white ink (always);
		 *            the assistant reply is wrapped in a paler panel.
		 *   FLAT     both sides lose their panels and read as body text on the
		 *            canvas — a conversation transcript, not a card stack.
		 *
		 * So the control governs BOTH sides. Ds-bot's `body[data-bt-layout=flat]
		 * .bt-bubble{background:none}` does the same to the assistant bubble there;
		 * this plugin additionally flattens its own indigo user panel, which ds-bot
		 * has no equivalent of.
		 */
		function layoutCss(current) {
			// Two facts about the shell that shape this block:
			//   1. only the user message has a bubble element; assistant replies are
			//      a bare Markdown root, so a panel has to be drawn here.
			//   2. the bubble's text colour comes from label-primary, i.e. dark ink,
			//      which is unreadable on the indigo surface. It must be repainted.
			// The same three flow kinds appear in both groups: the element itself
			// gets the ink, and `*` covers the Markdown descendants whose class
			// prefix is not stable across builds (`_markdown` does not exist here).
			// The `*` group is what keeps ReferenceChip (`@file`, `/command` badges)
			// readable: a chip carries `color:state-business-primary`, which sits
			// at ~2:1 contrast on the indigo surface without this override.
			const userBubbleSelectors = [
				'[class*="_userRow"] [class*="_bubble"]',
				'[data-chat-flow-kind="question-reply"] [class*="_bubble"]',
				'[data-chat-flow-kind="command-input"] [class*="_bubble"]',
			];
			const userInk = [
				userBubbleSelectors.map((s) => s + ",").join("\n").replace(/,$/, "{"),
				"  color:var(--dml-user-ink) !important;",
				"}",
				userBubbleSelectors.map((s) => s + " *,").join("\n").replace(/,$/, "{"),
				"  color:var(--dml-user-ink) !important;",
				"}",
			].join("\n");

			// FLAT (conversation shape): the assistant loses its panel (below) and
			// your own bubbles are flattened too — both sides read as plain body
			// text on the canvas, exactly like a chat transcript. Ink falls back to
			// label-primary so dark-on-light survives the paint removal.
			const flatUser = current.layout === "flat"
				? [
					[...userBubbleSelectors, ...userBubbleSelectors.map((s) => s + " *")].join(",\n") + "{",
					"  background:none !important;",
					"  color:var(--dsw-alias-label-primary) !important;",
					"}",
				].join("\n")
				: "";

			// The panel goes on the flow item itself, NOT on the slot anchor inside
			// it: every slot anchor is `display:contents`, so a background painted
			// there generates no box at all. The flow item is the real element.
			//
			// `:not(:empty)` is load-bearing. When a turn is folded the shell keeps
			// the flow items but collapses what is inside them; the shell's own rule
			// `.flowItem:is(:empty,:has(>[data-slot]:empty)){height:0}` flattens them
			// to zero height. A background + padding here would still paint a box on
			// that zero-height element — a tall thin sliver of panel colour hanging
			// under a folded turn. Gating on content keeps folded turns clean.
			const assistantPanel = current.layout === "flat"
				? ""
				: [
					// `data-chat-group-part` separates the two halves of one assistant
					// step: "reasoning" (the thinking row) and "response" (the reply).
					// Only the reply gets a panel; panelling the thinking row would
					// paint a box around a disclosure control.
					// Mirror the shell's own empty test exactly
					// (`.flowItem:is(:empty,:has(>[data-slot]:empty)){height:0}`),
					// inverted. Both halves are needed: an empty slot anchor leaves a
					// non-empty parent behind, and a hidden member has no anchor at all.
					'[data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]:not(:empty):not(:has(>[data-slot="conversation.chat.node"]:empty)):not([data-turn-process-hidden]){',
					"  background:var(--dml-assistant-bg) !important;",
					"  border-radius:18px !important;",
					"  padding:7px 12px !important;",
					"  box-sizing:border-box !important;",
					// Hug the reply, the way ds-bot's bubble does, instead of
					// stretching the panel across the whole column.
					"  width:fit-content !important;",
					"  max-width:100% !important;",
					"}",
				].join("\n");

			return [userInk, flatUser, assistantPanel].filter((part) => part !== "").join("\n");
		}

		/**
		 * Sidebar chrome, minimal mode.
		 *
		 * Two pieces of shell furniture are decoration rather than navigation:
		 * the brand mark above the panel list, and the avatar + name inside the
		 * account launcher pinned to the foot. Both are hidden; the launcher
		 * itself stays, because it is the sidebar's only door to Settings — its
		 * contents are swapped for a gear drawn with a mask, tinted by the
		 * button's own `currentColor` so it follows both schemes.
		 *
		 * Selectors match on the stable half of the CSS-module class names
		 * (`_brandMark`): the hash prefix changes every build, the suffix does
		 * not. The launcher is picked by semantics, not by class: it is the one
		 * `aria-haspopup="menu"` button pinned in `_footArea`. Matching
		 * `[class*="_trigger"]` would also catch the settings plugin's
		 * `_triggerRow` / `_triggerLabel`, whose class names contain that
		 * substring.
		 */
		const GEAR = "data:image/svg+xml," + encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
				'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>' +
				'<circle cx="12" cy="12" r="3"/></svg>'
		);

		function chromeCss(current) {
			if (current.chrome !== "minimal") return "";
			const trigger = '[class*="_footArea"] button[aria-haspopup="menu"]';
			return [
				// The whole brand block: mark, name, and the version chip. Matching
				// `_brand` also catches `_brandMark`, `_brandName` and `_brandIdentity`.
				'[class*="_logoRow"] [class*="_brand"]{display:none !important}',
				// ...and the row it lived in, so the new-session button and everything
				// under it rise into the space instead of leaving a 60px void. Height,
				// padding and the rail's bottom margin all go; the row cannot be
				// removed from the tree (it is the shell's drag strip), only flattened.
				'[class*="_logoRow"]{height:0 !important;min-height:0 !important;margin:0 !important;padding:0 !important;overflow:hidden !important}',
				// Everything the account launcher used to show: avatar, name, and the
				// ellipsis the signed-out state puts in the avatar's place.
				trigger + ">*{display:none !important}",
				// The gear that takes their place, pinned to the left edge so it lines up
				// with the panel rows above it; the shell centres this row by default.
				trigger + "{justify-content:flex-start !important;gap:0 !important}",
				trigger + "::before{",
				"  content:'';",
				"  width:20px;height:20px;flex:none;",
				"  background-color:currentColor;",
				"  -webkit-mask:url(" + JSON.stringify(GEAR) + ") center/20px 20px no-repeat;",
				"  mask:url(" + JSON.stringify(GEAR) + ") center/20px 20px no-repeat;",
				"}",
			].join("\n");
		}

		/**
		 * Ink weight, written as a text-stroke rather than `font-weight`.
		 *
		 * `font-weight` is not stepless in practice: SF Pro is variable, but
		 * PingFang SC and most other CJK system faces are not, so 450 renders as
		 * 400 and the slider would move in two or three jumps. A stroke is
		 * genuinely continuous and does not reflow a single line.
		 *
		 * Two scopes, because the two halves of the screen are read differently:
		 * the conversation (prose elements only) and the sidebar chrome, which is
		 * label-sized text in spans and buttons. Weight 0 writes no rule at all.
		 */
		const BODY_TEXT = "h1, h2, h3, h4, p, li, td, th";
		const SIDEBAR_TEXT =
			"span, div, button, a, p, li, label, strong, em, small, h1, h2, h3, h4, h5, h6";

		/** One stroke block per scope, or "" when that slider sits at 0. */
		function strokeBlock(scope, text, weight) {
			const width = (weight / 100) * STROKE_MAX;
			if (width === 0) return "";
			const head = scope === "body" ? "body" : '[class*="_sidebarCol"]';
			return [
				head + " :is(" + text + ") {",
				"  -webkit-text-stroke-width:" + width.toFixed(3) + "px;",
				"  -webkit-text-stroke-color:currentColor;",
				"  paint-order:stroke fill;",
				"}",
			].join("\n");
		}

		function inkCss(current) {
			return [
				strokeBlock("body", BODY_TEXT, current.weightBody),
				strokeBlock("sidebar", SIDEBAR_TEXT, current.weightSidebar),
			]
				.filter((part) => part !== "")
				.join("\n");
		}

		// --- Click "工作区" to reveal archived sessions ---------------------------
		/**
		 * The workspace browser's section label is plain text; archived sessions are
		 * hidden by a view filter that lives in the browser's own store. There is no
		 * exported service to flip it, so this drives the same control the user
		 * would: open the view-options menu and pick the archived row.
		 *
		 * The menu is made invisible for the two frames the dance lasts (via the
		 * `data-dml-menu-ghost` attribute on <html>), so the label behaves like a
		 * toggle rather than flashing a menu. Every step is defensive: if the shell
		 * renames the menu items, the click simply does nothing.
		 */
		const WORKSPACE_VIEW_KEY = "dsh.workspace.view.v5";
		const ARCHIVED_ITEM = /显示已归档|显示归档|Show archived/i;
		const HIDDEN_ITEM = /隐藏已归档|隐藏归档|Hide archived/i;

		function archivedFilterNow() {
			try {
				const raw = window.localStorage.getItem(WORKSPACE_VIEW_KEY);
				return raw === null ? "default" : JSON.parse(raw)?.archivedFilter ?? "default";
			} catch {
				return "default";
			}
		}

		/** Anchors and menu rows are found by role and text, never by hashed class. */
		function viewOptionsAnchor() {
			const header = document.querySelector('[class*="_sectionHeader"]');
			if (header === null) return null;
			const buttons = Array.from(header.querySelectorAll("button"));
			return (
				buttons.find((el) => /视图选项|View options/i.test(el.getAttribute("aria-label") ?? "")) ??
				buttons[buttons.length - 1] ??
				null
			);
		}

		/**
		 * The browser keeps each group short and offers "展开其余 N 个会话" instead
		 * of rendering the tail. Rows that were never rendered cannot be revealed
		 * with CSS, so this presses that button until none is left: each press
		 * either raises the watermark or, on the last one, sets it to Infinity.
		 * Capped so a shell that never drops the button cannot spin here.
		 */
		const OVERFLOW = 'button[class*="_sessionOverflowButton"]:not([aria-expanded="true"])';

		function expandOverflow(attempt) {
			const round = attempt ?? 0;
			const root = document.documentElement;
			const stop = () => {
				delete root.dataset.dmlExpanding;
			};
			if (round === 0) root.dataset.dmlExpanding = "1";
			if (round > 60) {
				stop();
				return;
			}
			const buttons = Array.from(document.querySelectorAll(OVERFLOW));
			if (buttons.length === 0) {
				// The list re-renders a frame or two after the filter flips; keep
				// looking briefly so the first pass does not give up too early.
				if (round < 30) requestAnimationFrame(() => expandOverflow(round + 1));
				else stop();
				return;
			}
			for (const button of buttons) button.click();
			requestAnimationFrame(() => expandOverflow(round + 1));
		}

		function pickMenuRow(pattern) {
			return Array.from(document.querySelectorAll('[role="menuitem"]')).find((el) =>
				pattern.test((el.textContent ?? "").trim())
			);
		}

		function toggleArchived() {
			const anchor = viewOptionsAnchor();
			if (anchor === null) return;
			const want = archivedFilterNow() === "default" ? "show" : "default";
			const pattern = want === "show" ? ARCHIVED_ITEM : HIDDEN_ITEM;
			const root = document.documentElement;
			root.dataset.dmlMenuGhost = "1";
			anchor.click();

			// Un-ghost a frame later: React closes the menu in the same task as the
			// click, and dropping the attribute here would show it for one frame.
			const finish = (ok) => {
				requestAnimationFrame(() => {
					delete root.dataset.dmlMenuGhost;
				});
				if (!ok) console.warn("dsh-moonstyle: archived filter control not found");
			};
			const started = performance.now();
			const step = () => {
				const row = pickMenuRow(pattern);
				if (row !== undefined) {
					row.click();
					finish(true);
					// Only showing archived needs this: when hiding them again the
					// groups shrink back on their own.
					if (want === "show") requestAnimationFrame(() => expandOverflow(0));
					return;
				}
				if (performance.now() - started > 600) {
					// Close the menu we opened so a failed run leaves no trace.
					anchor.click();
					finish(false);
					return;
				}
				requestAnimationFrame(step);
			};
			requestAnimationFrame(step);
		}

		// --- Arrow keys move between sessions ------------------------------------
		/**
		 * While the app has focus, Up/Down step through the visible session rows and
		 * the body stops scrolling on those two keys. Typing always wins: the
		 * composer, any input, and any open dialog or menu keep their arrows.
		 *
		 * Rows are picked by their own data attribute (`data-row-key="session:…"`)
		 * rather than by class, and "current" is the row the shell marks selected,
		 * falling back to the focused row.
		 */
		const SESSION_ROW = '[data-row-key^="session:"][role="treeitem"]';

		/** The field the key lands in, when it lands in an editable one. */
		function editableOf(target) {
			if (!(target instanceof Element)) return null;
			return target.closest(
				'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'
			);
		}

		/**
		 * Only a blank field yields its arrows.
		 *
		 * The shell moves focus into the composer after a session switch, which
		 * would otherwise end the arrow run after the first press. An empty
		 * composer has no caret to move and no history to step, so Up/Down there
		 * still mean "next/previous session"; the moment the field holds text,
		 * arrows go back to the caret. A `select` never yields: its arrows pick
		 * options.
		 */
		function blankEditable(element) {
			const tag = element.tagName;
			if (tag === "SELECT") return false;
			if (tag === "INPUT" || tag === "TEXTAREA") return String(element.value ?? "").trim() === "";
			return (element.textContent ?? "").trim() === "";
		}

		function visibleSessionRows() {
			return Array.from(document.querySelectorAll(SESSION_ROW)).filter(
				(row) => row.getClientRects().length > 0
			);
		}

		function onArrowKey(event) {
			if (event.defaultPrevented || event.isComposing) return;
			if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
			if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
			const editable = editableOf(event.target);
			if (editable !== null && !blankEditable(editable)) return;
			if (document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]') !== null) return;
			const rows = visibleSessionRows();
			if (rows.length === 0) return;
			const step = event.key === "ArrowDown" ? 1 : -1;
			let index = rows.findIndex((row) => row.getAttribute("aria-selected") === "true");
			if (index === -1) {
				index = rows.findIndex(
					(row) => row === document.activeElement || row.contains(document.activeElement)
				);
			}
			const from = index === -1 ? (step > 0 ? -1 : rows.length) : index;
			// Wrap: Down on the last row lands on the first, Up on the first lands
			// on the last. A single row stays put (and still swallows the key).
			const next = (((from + step) % rows.length) + rows.length) % rows.length;
			// Swallow the key unconditionally: the body no longer scrolls on Up/Down
			// while the sidebar owns them.
			event.preventDefault();
			if (next !== index) rows[next].click();
		}

		/** Delegated: the label is re-rendered on every group-by or filter change. */
		function onSectionLabelClick(event) {
			const label = event.target instanceof Element ? event.target.closest('[class*="_sectionLabel"]') : null;
			if (label === null) return;
			if (/工作区|Workspaces?/i.test((label.textContent ?? "").trim()) === false) return;
			event.preventDefault();
			event.stopPropagation();
			toggleArchived();
		}

		/** Hide the menu while `toggleArchived` drives it. */
		const GHOST_CSS =
			'[data-dml-menu-ghost] [role="menu"]{visibility:hidden !important}' +
			// The overflow button is pressed a few frames after the list paints; hide
			// it for that window so "展开其余 N 个会话" never flashes on screen.
			'[data-dml-expanding] button[class*="_sessionOverflowButton"]{visibility:hidden !important}';

		/**
		 * The folder row above a group of sessions is the sidebar's heading, so it
		 * gets heading type: 16px at semibold, against the session rows' 14px
		 * regular. The shell writes `font-size:14px` for `_title` once, shared by
		 * both rows, which is why the two levels currently read as equals — two
		 * attribute selectors outrank that single class without `!important`.
		 *
		 * `_renameInput` is included so renaming a group does not shrink the text
		 * back to session size mid-edit.
		 */
		const PROJECT_CSS = [
			'[class*="_projectRow"] [class*="_title"],',
			'[class*="_projectRow"] [class*="_renameInput"] {',
			"  font-size:16px;",
			"  line-height:22px;",
			"  font-weight:600;",
			"  letter-spacing:-0.01em;",
			"}",
		].join("\n");

		/**
		 * Trim the sidebar title to the chosen character count. CSS, not text
		 * surgery: an exact count would need an observer fighting every re-render,
		 * while `em` is one CJK glyph at the row's own size. Latin names fit a few
		 * more letters in the same width.
		 */
		function titleCss(current) {
			return [
				'[class*="_sessionRow"] [class*="_title"]{',
				"  max-width:" + current.titleChars + "em;",
				"  overflow:hidden;",
				"  text-overflow:ellipsis;",
				"  white-space:nowrap;",
				"}",
			].join("\n");
		}

		/**
		 * The row's trailing text is either a relative time or a state label, and
		 * the shell marks which: `_timestamp` is added only when the text is the
		 * time. Hiding that class leaves 进行中 / 待回答 and friends untouched.
		 */
		function rowTimeCss(current) {
			if (current.rowTime === "show") return "";
			return '[class*="_sessionRow"] [class*="_timestamp"]{display:none !important}';
		}

		/** Settings row chrome, matched to the shell's own rows. */
		const ROW_CSS = [
			".dml-row{border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:24px;padding:16px 0;display:flex}",
			".dml-text{min-width:0}",
			".dml-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}",
			".dml-desc{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}",
			".dml-control{flex:none;align-items:center;gap:10px;display:flex}",
			".dml-fallback{border:1px solid var(--dsw-alias-border-l3);border-radius:6px;padding:4px 10px;font:inherit;color:var(--dsw-alias-label-primary);background:transparent;cursor:pointer}",
			".dml-fallback[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active)}",
			".dml-slider{align-items:center;gap:10px;display:flex}",
			".dml-range{width:132px;accent-color:var(--dsw-alias-state-business-primary);cursor:pointer}",
			".dml-readout{min-width:22px;text-align:right;font-size:12px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}",
			// The shell removes the hairline from a slot item's last child only, and
			// the item here is our wrapper; without this the last row keeps one.
			".dml-wrap>.dml-row:last-child{border-bottom:none}",
		].join("\n");

		/**
		 * The next block is concatenated after one that ends in `}`, so a newline is
		 * required for legibility only — `}body{` is valid CSS but unreadable.
		 */
		const styleSheet = (current) =>
			[
				paletteCss(current),
				layoutCss(current),
				chromeCss(current),
				inkCss(current),
				ROW_CSS,
				GHOST_CSS,
				PROJECT_CSS,
				titleCss(current),
				rowTimeCss(current),
			]
				.filter((part) => part !== "")
				.join("\n");

		let styleElement = null;

		/** Recompute the sheet and the body attribute from `prefs`. */
		function paint() {
			if (typeof document === "undefined" || styleElement === null) return;
			styleElement.textContent = styleSheet(prefs);
		}

		// --- Settings row --------------------------------------------------------
		const NS = "settings.moonstyle";

		const TEXT = {
			zh: {
				layout: "消息形态",
				layoutDesc: "你自己的消息显示为气泡，还是铺成正文。",
				layoutBubble: "气泡",
				layoutFlat: "会话",
				palette: "配色",
				paletteDesc: "这套月光配色，或回到 DeepSeek Harness 原生。",
				paletteMoon: "月光",
				paletteStock: "原生",
				chrome: "侧栏装饰",
				chromeDesc: "精简时左上一片空白，左下角的头像和名称换成一个齿轮。",
				chromeFull: "显示",
				chromeMinimal: "精简",
				weightBody: "正文字重",
				weightBodyDesc: "会话里正文的笔画厚度，向右加粗。只加墨，不改字号、不重排。",
				weightSidebar: "侧栏字重",
				weightSidebarDesc: "侧栏和面板里的文字厚度，与正文分开调。",
				titleChars: "侧栏标题长度",
				titleCharsDesc: "侧栏里会话名显示到第几个字，超出部分用省略号。",
				rowTime: "侧栏时间",
				rowTimeDesc: "空闲时那串相对时间（刚刚 / 5分钟）。进行中、待回答这类状态始终显示。",
				rowTimeHide: "隐藏",
				rowTimeShow: "显示",
			},
			en: {
				layout: "Message shape",
				layoutDesc: "Show your own messages as a bubble, or as body text.",
				layoutBubble: "Bubble",
				layoutFlat: "Conversation",
				palette: "Palette",
				paletteDesc: "This moonlight palette, or stock DeepSeek Harness.",
				paletteMoon: "Moonlight",
				paletteStock: "Stock",
				chrome: "Sidebar chrome",
				chromeDesc: "Minimal blanks the top-left corner and turns the avatar + name into a single gear.",
				chromeFull: "Full",
				chromeMinimal: "Minimal",
				weightBody: "Body ink",
				weightBodyDesc: "Stroke thickness for conversation text; heavier to the right. Ink only, no reflow.",
				weightSidebar: "Sidebar ink",
				weightSidebarDesc: "Stroke thickness for the sidebar and panel labels; tuned separately.",
				titleChars: "Sidebar title length",
				titleCharsDesc: "How many characters of a session name the sidebar shows before the ellipsis.",
				rowTime: "Sidebar time",
				rowTimeDesc: "The relative timestamp on idle rows. State labels such as running or waiting always show.",
				rowTimeHide: "Hide",
				rowTimeShow: "Show",
			},
		};

		/**
		 * Resolved once. A missing primitives module must not take the plugin
		 * down, so the row falls back to plain buttons that speak the same
		 * { value, options, onChange } contract.
		 */
		const segmented = (() => {
			try {
				const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
				if (typeof primitives?.SegmentedControl === "function") return primitives.SegmentedControl;
			} catch {
				// Fall through to the local control.
			}
			return function FallbackSegmented(props) {
				return h(
					"div",
					{ className: "dml-control", role: "group", "aria-label": props.label },
					props.options.map((option) =>
						h(
							"button",
							{
								key: option.value,
								type: "button",
								className: "dml-fallback",
								"aria-pressed": option.value === props.value,
								onClick: () => props.onChange(option.value),
							},
							option.label
						)
					)
				);
			};
		})();

		/** One labelled row: title + description on the left, control on the right. */
		function Row({ title, description, children }) {
			return h("div", { className: "dml-row" }, [
				h("div", { className: "dml-text", key: "text" }, [
					h("div", { className: "dml-title", key: "title" }, title),
					h("div", { className: "dml-desc", key: "desc" }, description),
				]),
				h("div", { className: "dml-control", key: "control" }, children),
			]);
		}

		/**
		 * Native range input. The one control with no discrete steps: everything
		 * else is a segmented pair, but weight is a number and a pair cannot say
		 * "a little heavier". `accent-color` keeps it in the shell's blue without
		 * a bespoke track.
		 */
		function Slider({ id, label, value, min, max, onChange }) {
			const low = min ?? 0;
			const high = max ?? 100;
			return h("div", { className: "dml-slider" }, [
				h("input", {
					key: "range",
					id,
					className: "dml-range",
					type: "range",
					min: low,
					max: high,
					step: 1,
					value,
					"aria-label": label,
					onChange: (event) => onChange(clampNumber(event.target.value, low, high, value)),
				}),
				h("span", { key: "readout", className: "dml-readout" }, String(value)),
			]);
		}

		/**
		 * The four controls. State comes from the module-level preference store
		 * rather than a slot store: the row and the stylesheet must agree on the
		 * same value, and a single subscription is enough for both.
		 */
		function ThemeRow(props) {
			const t = props.t;
			const [state, setState] = React.useState(getPrefs);

			React.useEffect(() => subscribe(setState), []);

			return h("div", { className: "dml-wrap" }, [
				h(Row, {
					key: "layout",
					title: t("layout"),
					description: t("layoutDesc"),
					children: h(segmented, {
						id: "dsh-moonstyle-layout",
						label: t("layout"),
						value: state.layout,
						options: [
							{ value: "bubble", label: t("layoutBubble") },
							{ value: "flat", label: t("layoutFlat") },
						],
						onChange: (next) => update({ layout: next }),
					}),
				}),
				h(Row, {
					key: "palette",
					title: t("palette"),
					description: t("paletteDesc"),
					children: h(segmented, {
						id: "dsh-moonstyle-palette",
						label: t("palette"),
						value: state.palette,
						options: [
							{ value: "moonlight", label: t("paletteMoon") },
							{ value: "stock", label: t("paletteStock") },
						],
						onChange: (next) => update({ palette: next }),
					}),
				}),
				h(Row, {
					key: "chrome",
					title: t("chrome"),
					description: t("chromeDesc"),
					children: h(segmented, {
						id: "dsh-moonstyle-chrome",
						label: t("chrome"),
						value: state.chrome,
						options: [
							{ value: "full", label: t("chromeFull") },
							{ value: "minimal", label: t("chromeMinimal") },
						],
						onChange: (next) => update({ chrome: next }),
					}),
				}),
				h(Row, {
					key: "weightBody",
					title: t("weightBody"),
					description: t("weightBodyDesc"),
					children: h(Slider, {
						id: "dsh-moonstyle-weight-body",
						label: t("weightBody"),
						value: state.weightBody,
						onChange: (next) => update({ weightBody: next }),
					}),
				}),
				h(Row, {
					key: "weightSidebar",
					title: t("weightSidebar"),
					description: t("weightSidebarDesc"),
					children: h(Slider, {
						id: "dsh-moonstyle-weight-sidebar",
						label: t("weightSidebar"),
						value: state.weightSidebar,
						onChange: (next) => update({ weightSidebar: next }),
					}),
				}),
				h(Row, {
					key: "titleChars",
					title: t("titleChars"),
					description: t("titleCharsDesc"),
					children: h(Slider, {
						id: "dsh-moonstyle-title-chars",
						label: t("titleChars"),
						value: state.titleChars,
						min: TITLE_CHARS_MIN,
						max: TITLE_CHARS_MAX,
						onChange: (next) => update({ titleChars: next }),
					}),
				}),
				h(Row, {
					key: "rowTime",
					title: t("rowTime"),
					description: t("rowTimeDesc"),
					children: h(segmented, {
						id: "dsh-moonstyle-row-time",
						label: t("rowTime"),
						value: state.rowTime,
						options: [
							{ value: "hide", label: t("rowTimeHide") },
							{ value: "show", label: t("rowTimeShow") },
						],
						onChange: (next) => update({ rowTime: next }),
					}),
				}),
			]);
		}

		// --- Plugin --------------------------------------------------------------
		const inject = ["theme", "slots", "locale"];

		function apply(ctx) {
			// The sheet is created once and rewritten in place: no observer, no timer.
			ctx.effect(() => {
				const element = document.createElement("style");
				element.id = STYLE_ID;
				document.head.appendChild(element);
				styleElement = element;
				const unsubscribe = subscribe(paint);
				paint();
				return () => {
					unsubscribe();
					styleElement = null;
					element.remove();
				};
			}, "dsh-moonstyle: theme sheet");

			// Type stays on the token layer so ui-theme's font settings keep working:
			// an !important font here would make those settings inert.
			ctx.effect(
				() =>
					ctx.theme.overrideTokens("dsh-moonstyle:tokens", {
						"--dsh-font-family-text-default": { light: FONT_ROUNDED, dark: FONT_STOCK },
					}),
				"dsh-moonstyle: type layer"
			);

			ctx.effect(
				() =>
					ctx.locale.register(NS, {
						zh: TEXT.zh,
						en: TEXT.en,
					}),
				"dsh-moonstyle: row copy"
			);

			ctx.effect(() => {
				document.addEventListener("click", onSectionLabelClick, true);
				return () => document.removeEventListener("click", onSectionLabelClick, true);
			}, "dsh-moonstyle: workspace archive toggle");

			ctx.effect(() => {
				document.addEventListener("keydown", onArrowKey);
				return () => document.removeEventListener("keydown", onArrowKey);
			}, "dsh-moonstyle: arrow-key session switching");

			ctx.slots.inject("settings.general.item", () =>
				ctx.slots.register(
					{
						name: "settings.general.item",
						id: "moonstyle",
						order: 12,
						locale: NS,
					},
					ThemeRow
				)
			);
		}

		exports.inject = inject;
		exports.apply = apply;
		return exports;
	},
});

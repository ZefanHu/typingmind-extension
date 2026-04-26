/**
 * Responses API Redirect Plugin for TypingMind
 *
 * Redirects requests from https://api.openai.com/v1/responses
 * to a custom endpoint. All original headers (including Authorization)
 * are kept unchanged.
 *
 * @version 1.0
 */
(() => {
    'use strict';

    class ResponsesRedirect {
        constructor() {
            this.CONFIG = {
                KEYS: {
                    TARGET_BASE: 'tm_resp_target_base',
                    ENABLED:     'tm_resp_enabled'
                },
                MENU_BUTTON_ID: 'responses-redirect-config-btn',
                SOURCE_PATTERN: 'https://api.openai.com/v1/responses'
            };

            this.targetBase = null;
            this.enabled    = false;

            this.loadConfig();
            this.init();
        }

        /* ── persistence ─────────────────────────────────────────── */

        loadConfig() {
            this.targetBase = localStorage.getItem(this.CONFIG.KEYS.TARGET_BASE);
            this.enabled    = localStorage.getItem(this.CONFIG.KEYS.ENABLED) === 'true';
        }

        saveConfig(targetBase) {
            localStorage.setItem(this.CONFIG.KEYS.TARGET_BASE, targetBase);
            localStorage.setItem(this.CONFIG.KEYS.ENABLED, 'true');
            this.loadConfig();
        }

        clearConfig() {
            Object.values(this.CONFIG.KEYS).forEach(k => localStorage.removeItem(k));
            this.loadConfig();
        }

        /* ── bootstrap ───────────────────────────────────────────── */

        init() {
            console.log('[Responses Redirect] Initializing...');
            this.interceptFetch();
            this.interceptXHR();
            this.interceptAxios();
            this.injectMenuButton();

            if (!this.enabled) {
                this.waitForDOM(() => setTimeout(() => this.showConfigDialog(), 1500));
            } else {
                console.log('[Responses Redirect] ✅ Active → redirecting to:', this.targetBase);
            }

            // Global debug API
            window.ResponsesRedirect = {
                showConfig:  () => this.showConfigDialog(),
                getConfig:   () => ({ targetBase: this.targetBase, enabled: this.enabled }),
                clearConfig: () => { this.clearConfig(); alert('🗑️ Config cleared. Refresh page.'); }
            };
        }

        waitForDOM(cb) {
            document.body ? cb() : document.addEventListener('DOMContentLoaded', cb);
        }

        /* ── URL rewrite helper ──────────────────────────────────── */

        rewriteUrl(url) {
            if (!url) return url;
            if (!this.enabled || !this.targetBase) return url;

            const src = this.CONFIG.SOURCE_PATTERN;
            if (!url.startsWith(src)) return url;

            // Preserve any path suffix after /v1/responses (e.g. /{id}/cancel)
            const suffix  = url.slice(src.length);              // e.g. "" or "/abc/cancel"
            const base    = this.targetBase.replace(/\/+$/, ''); // strip trailing slash
            return base + '/v1/responses' + suffix;
        }

        /* ── fetch interceptor ───────────────────────────────────── */

        interceptFetch() {
            const self = this;
            const orig = window.fetch;

            window.fetch = function (input, init) {
                const url = typeof input === 'string' ? input : input?.url;
                const newUrl = self.rewriteUrl(url);

                if (newUrl !== url) {
                    console.log('[Responses Redirect] fetch:', url, '→', newUrl);
                    input = typeof input === 'string'
                        ? newUrl
                        : new Request(newUrl, input);   // keep all original headers
                }

                return orig.call(this, input, init);
            };

            console.log('[Responses Redirect] fetch interceptor installed');
        }

        /* ── XMLHttpRequest interceptor ──────────────────────────── */

        interceptXHR() {
            const self    = this;
            const origOpen = XMLHttpRequest.prototype.open;

            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                const newUrl = self.rewriteUrl(url);
                if (newUrl !== url) {
                    console.log('[Responses Redirect] XHR:', url, '→', newUrl);
                }
                return origOpen.call(this, method, newUrl, ...rest);
            };

            console.log('[Responses Redirect] XHR interceptor installed');
        }

        /* ── axios interceptor (optional, lazy) ─────────────────── */

        interceptAxios() {
            const self = this;
            const try_ = () => {
                if (!window.axios) { setTimeout(try_, 500); return; }

                window.axios.interceptors.request.use(cfg => {
                    if (cfg.url) {
                        const n = self.rewriteUrl(cfg.url);
                        if (n !== cfg.url) {
                            console.log('[Responses Redirect] axios:', cfg.url, '→', n);
                            cfg.url = n;
                        }
                    }
                    return cfg;
                });

                console.log('[Responses Redirect] axios interceptor installed');
            };
            try_();
        }

        /* ── menu button ─────────────────────────────────────────── */

        injectMenuButton() {
            const observer = new MutationObserver(() => {
                const menus = document.querySelectorAll(
                    '[role="menu"][aria-labelledby*="headlessui-menu-button"]'
                );

                for (const menu of menus) {
                    // Only target the "More actions" menu (contains "Reset chat")
                    const spans = menu.querySelectorAll('span.text-left');
                    const isTarget = [...spans].some(s => s.textContent?.includes('Reset chat'));
                    if (!isTarget) continue;
                    if (menu.querySelector(`#${this.CONFIG.MENU_BUTTON_ID}`)) continue;

                    const template = menu.querySelector('[role="menuitem"]');
                    if (!template) continue;

                    const btn = template.cloneNode(true);
                    btn.id = this.CONFIG.MENU_BUTTON_ID;
                    btn.removeAttribute('data-headlessui-state');

                    const textSpan = btn.querySelector('span.text-left');
                    if (textSpan) textSpan.textContent = '🔀 Responses API Redirect';

                    btn.querySelector('.font-normal.text-slate-500')?.remove();
                    btn.querySelector('div:has(svg[data-tooltip-id="global"])')?.remove();

                    const dot = this.enabled
                        ? '<span style="color:#22c55e;font-size:10px;">●</span> '
                        : '<span style="color:#f97316;font-size:10px;">●</span> ';
                    const iconBox = btn.querySelector('.flex.items-center.justify-center.gap-x-2');
                    if (iconBox) iconBox.innerHTML = dot + iconBox.innerHTML;

                    btn.addEventListener('click', () => this.showConfigDialog());
                    menu.appendChild(btn);
                    console.log('[Responses Redirect] menu button injected');
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }

        /* ── config dialog ───────────────────────────────────────── */

        showConfigDialog() {
            document.getElementById('resp-redirect-dialog')?.remove();

            const d = document.createElement('div');
            d.id = 'resp-redirect-dialog';

            const currentTarget = this.targetBase || '';

            d.innerHTML = `
            <style>
                #resp-redirect-dialog * { box-sizing: border-box; }
                #resp-redirect-dialog input:focus {
                    outline: none;
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,.15);
                }
                @keyframes rrd-in {
                    from { opacity:0; transform:translateY(-12px) scale(.97); }
                    to   { opacity:1; transform:translateY(0)   scale(1);    }
                }
                .rrd-card { animation: rrd-in .2s ease-out; }
            </style>
            <div class="rrd-backdrop"
                 style="position:fixed;inset:0;background:rgba(0,0,0,.55);
                        z-index:999999;display:flex;align-items:center;
                        justify-content:center;
                        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <div class="rrd-card"
                     style="background:#fff;border-radius:16px;padding:32px;
                            width:90%;max-width:560px;
                            box-shadow:0 24px 64px rgba(0,0,0,.25);">

                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
                        <span style="font-size:28px;">🔀</span>
                        <h2 style="margin:0;font-size:22px;font-weight:700;color:#111;">
                            Responses API Redirect
                        </h2>
                    </div>
                    <p style="margin:0 0 24px 40px;font-size:13px;color:#666;">
                        Transparently redirect <code style="background:#f3f4f6;padding:1px 5px;
                        border-radius:4px;font-size:12px;">/v1/responses</code> to your own base URL.<br>
                        API keys and all other headers are forwarded unchanged.
                    </p>

                    <!-- Source (read-only info) -->
                    <div style="margin-bottom:18px;padding:12px 16px;background:#fafafa;
                                border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#555;">
                        <span style="font-weight:600;color:#111;">Intercepts:</span><br>
                        <code style="color:#dc2626;">https://api.openai.com/v1/responses</code>
                        &nbsp;(+ any sub-path)
                    </div>

                    <!-- Target URL -->
                    <div style="margin-bottom:24px;">
                        <label style="display:block;margin-bottom:7px;font-weight:600;
                                      font-size:13px;color:#333;">
                            Redirect Base URL
                        </label>
                        <input type="text" id="rrd-target"
                               placeholder="https://api.ephone.ai"
                               value="${currentTarget}"
                               style="width:100%;padding:11px 14px;border:2px solid #e5e7eb;
                                      border-radius:8px;font-size:14px;transition:all .2s;
                                      font-family:monospace;">
                        <div style="margin-top:7px;font-size:12px;color:#888;">
                            The plugin will call
                            <code style="color:#6366f1;">&lt;base&gt;</code><code>/v1/responses</code>
                            — do <em>not</em> include <code>/v1/responses</code> in the field above.
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div style="display:flex;gap:10px;">
                        <button id="rrd-save"
                                style="flex:1;padding:13px;background:#6366f1;color:#fff;
                                       border:none;border-radius:8px;cursor:pointer;
                                       font-weight:700;font-size:15px;transition:background .2s;">
                            💾 Save &amp; Enable
                        </button>
                        <button id="rrd-disable"
                                style="padding:13px 18px;background:#fef2f2;color:#dc2626;
                                       border:1px solid #fecaca;border-radius:8px;cursor:pointer;
                                       font-weight:600;font-size:14px;transition:background .2s;">
                            Disable
                        </button>
                        <button id="rrd-cancel"
                                style="padding:13px 18px;background:#f3f4f6;color:#555;
                                       border:none;border-radius:8px;cursor:pointer;
                                       font-weight:600;font-size:14px;transition:background .2s;">
                            Cancel
                        </button>
                    </div>

                    <!-- Status info -->
                    <div style="margin-top:18px;padding:14px 16px;
                                background:${this.enabled ? '#f0fdf4' : '#fff7ed'};
                                border-left:4px solid ${this.enabled ? '#22c55e' : '#f97316'};
                                border-radius:4px;font-size:13px;line-height:1.6;
                                color:${this.enabled ? '#14532d' : '#7c2d12'};">
                        <strong>Status: ${this.enabled ? '✅ Active' : '⚠️ Not configured'}</strong>
                        ${this.enabled && this.targetBase
                            ? `<br>Currently redirecting to <code>${this.targetBase}</code>`
                            : '<br>Enter a base URL above and save to activate.'}
                    </div>
                </div>
            </div>`;

            document.body.appendChild(d);

            const input    = d.querySelector('#rrd-target');
            const saveBtn  = d.querySelector('#rrd-save');
            const disBtn   = d.querySelector('#rrd-disable');
            const cancelBtn= d.querySelector('#rrd-cancel');
            const backdrop = d.querySelector('.rrd-backdrop');

            // Hover states
            saveBtn.onmouseenter  = () => saveBtn.style.background  = '#4f46e5';
            saveBtn.onmouseleave  = () => saveBtn.style.background  = '#6366f1';
            disBtn.onmouseenter   = () => disBtn.style.background   = '#fee2e2';
            disBtn.onmouseleave   = () => disBtn.style.background   = '#fef2f2';
            cancelBtn.onmouseenter= () => cancelBtn.style.background= '#e5e7eb';
            cancelBtn.onmouseleave= () => cancelBtn.style.background= '#f3f4f6';

            saveBtn.addEventListener('click', () => {
                const val = input.value.trim().replace(/\/+$/, '');
                if (!val) { alert('⚠️ Please enter a base URL'); return; }
                if (!/^https?:\/\//.test(val)) {
                    alert('⚠️ URL must start with http:// or https://');
                    return;
                }
                this.saveConfig(val);
                d.remove();
                if (confirm(`✅ Saved!\n\nRedirecting /v1/responses → ${val}/v1/responses\n\nRefresh page to activate?`)) {
                    location.reload();
                }
            });

            disBtn.addEventListener('click', () => {
                if (!confirm('Disable redirect and restore original OpenAI endpoint?')) return;
                this.clearConfig();
                d.remove();
                if (confirm('Disabled. Refresh page to apply?')) location.reload();
            });

            cancelBtn.addEventListener('click', () => d.remove());
            backdrop.addEventListener('click', e => { if (e.target === backdrop) d.remove(); });

            const esc = e => { if (e.key === 'Escape') { d.remove(); document.removeEventListener('keydown', esc); } };
            document.addEventListener('keydown', esc);

            setTimeout(() => input.focus(), 100);
        }
    }

    // Bootstrap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new ResponsesRedirect());
    } else {
        new ResponsesRedirect();
    }

    console.log('[Responses Redirect] Plugin loaded v1.0');
})();

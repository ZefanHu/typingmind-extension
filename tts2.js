/**
 * TTS API Redirect Plugin for TypingMind
 * 
 * Redirects Text-to-Speech requests from OpenAI to custom API endpoint.
 * Supports localStorage-based configuration with UI dialog.
 * 
 * @version 3.0
 * @author Hu Zefan
 */
(() => {
    'use strict';

    class TTSRedirect {
        constructor() {
            // Configuration keys
            this.CONFIG = {
                KEYS: {
                    API_URL: 'tm_tts_api_url',
                    API_KEY: 'tm_tts_api_key',
                    CONFIGURED: 'tm_tts_configured'
                },
                MENU_BUTTON_ID: 'tts-redirect-config-btn'
            };

            // State
            this.isConfigured = false;
            this.apiUrl = null;
            this.apiKey = null;
            
            // Load configuration
            this.loadConfig();
            
            // Initialize
            this.init();
        }

        /** Load configuration from localStorage */
        loadConfig() {
            this.apiUrl = localStorage.getItem(this.CONFIG.KEYS.API_URL);
            this.apiKey = localStorage.getItem(this.CONFIG.KEYS.API_KEY);
            this.isConfigured = localStorage.getItem(this.CONFIG.KEYS.CONFIGURED) === 'true';
        }

        /** Save configuration to localStorage */
        saveConfig(apiUrl, apiKey) {
            localStorage.setItem(this.CONFIG.KEYS.API_URL, apiUrl);
            localStorage.setItem(this.CONFIG.KEYS.API_KEY, apiKey);
            localStorage.setItem(this.CONFIG.KEYS.CONFIGURED, 'true');
            this.loadConfig();
        }

        /** Clear configuration */
        clearConfig() {
            Object.values(this.CONFIG.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            this.loadConfig();
        }

        /** Initialize the plugin */
        init() {
            console.log('[TTS Redirect] Initializing...');
            
            // Install fetch interceptor immediately
            this.interceptFetch();
            
            // Monitor for axios and intercept when available
            this.interceptAxios();
            
            // Inject menu button
            this.injectMenuButton();
            
            // Show config dialog if not configured
            if (!this.isConfigured) {
                console.log('[TTS Redirect] Not configured. Waiting for DOM...');
                this.waitForDOM(() => {
                    setTimeout(() => this.showConfigDialog(), 1500);
                });
            } else {
                console.log('[TTS Redirect] ✅ Enabled | API:', this.apiUrl);
            }
            
            // Expose global API
            window.TTSRedirect = {
                showConfig: () => this.showConfigDialog(),
                getConfig: () => ({
                    apiUrl: this.apiUrl,
                    apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : null,
                    configured: this.isConfigured
                }),
                clearConfig: () => {
                    this.clearConfig();
                    alert('🗑️ Configuration cleared. Refresh to reconfigure.');
                }
            };
        }

        /** Wait for DOM to be ready */
        waitForDOM(callback) {
            if (document.body) {
                callback();
            } else {
                document.addEventListener('DOMContentLoaded', callback);
            }
        }

        /** Intercept fetch API */
        interceptFetch() {
            const originalFetch = window.fetch;
            const self = this;

            window.fetch = function(input, init) {
                const url = typeof input === 'string' ? input : input?.url;
                
                // Check if this is a TTS request
                if (url && url.includes('/audio/speech') && url.includes('openai.com')) {
                    if (!self.isConfigured) {
                        console.warn('[TTS Redirect] Request detected but not configured!');
                        return originalFetch.call(this, input, init);
                    }

                    console.log('[TTS Redirect] 🎯 Intercepted TTS request');
                    
                    // Replace URL
                    const newUrl = url.replace(
                        /https:\/\/api\.openai\.com\/v1\/audio\/speech/g,
                        self.apiUrl
                    );
                    
                    // Clone init and update headers
                    const newInit = { ...(init || {}) };
                    newInit.headers = new Headers(newInit.headers || {});
                    newInit.headers.set('Authorization', `Bearer ${self.apiKey}`);
                    
                    console.log('[TTS Redirect] ✅ Redirected:', {
                        from: url,
                        to: newUrl
                    });
                    
                    return originalFetch.call(this, newUrl, newInit);
                }
                
                return originalFetch.call(this, input, init);
            };
            
            console.log('[TTS Redirect] Fetch interceptor installed');
        }

        /** Intercept axios (if present) */
        interceptAxios() {
            const self = this;
            const checkAndIntercept = () => {
                if (window.axios?.post) {
                    const originalPost = window.axios.post;
                    
                    window.axios.post = function(url, data, config) {
                        if (url && url.includes('/audio/speech') && url.includes('openai.com')) {
                            if (!self.isConfigured) {
                                return originalPost.call(this, url, data, config);
                            }
                            
                            console.log('[TTS Redirect] 🎯 Intercepted axios TTS request');
                            
                            config = { 
                                ...(config || {}), 
                                headers: { 
                                    ...config?.headers, 
                                    Authorization: `Bearer ${self.apiKey}` 
                                } 
                            };
                            
                            return originalPost.call(this, self.apiUrl, data, config);
                        }
                        return originalPost.call(this, url, data, config);
                    };
                    
                    console.log('[TTS Redirect] Axios interceptor installed');
                } else {
                    // Retry after 500ms if axios not yet available
                    setTimeout(checkAndIntercept, 500);
                }
            };
            checkAndIntercept();
        }

        /** Inject configuration button into TypingMind's "More actions" menu */
        injectMenuButton() {
            const observer = new MutationObserver(() => {
                const menus = document.querySelectorAll('[role="menu"][aria-labelledby*="headlessui-menu-button"]');
                if (!menus.length) return;

                // Find the correct menu (the one with "Reset chat")
                let targetMenu = null;
                for (const menu of menus) {
                    const items = menu.querySelectorAll('span.text-left');
                    for (const item of items) {
                        if (item.textContent?.includes('Reset chat')) {
                            targetMenu = menu;
                            break;
                        }
                    }
                    if (targetMenu) break;
                }

                if (!targetMenu) return;
                if (targetMenu.querySelector(`#${this.CONFIG.MENU_BUTTON_ID}`)) return;

                // Clone existing menu item as template
                const template = targetMenu.querySelector('[role="menuitem"]');
                if (!template) return;

                const btn = template.cloneNode(true);
                btn.id = this.CONFIG.MENU_BUTTON_ID;
                btn.removeAttribute('data-headlessui-state');

                // Update text
                const textSpan = btn.querySelector('span.text-left');
                if (textSpan) {
                    textSpan.textContent = '🎙️ TTS API Config';
                }

                // Remove unnecessary elements
                btn.querySelector('.font-normal.text-slate-500')?.remove();
                btn.querySelector('div:has(svg[data-tooltip-id="global"])')?.remove();

                // Add status indicator
                const statusIcon = this.isConfigured 
                    ? '<span class="text-green-500 text-xs">●</span>' 
                    : '<span class="text-orange-500 text-xs">●</span>';
                
                const iconContainer = btn.querySelector('.flex.items-center.justify-center.gap-x-2');
                if (iconContainer) {
                    iconContainer.innerHTML = statusIcon + iconContainer.innerHTML;
                }

                // Add click handler
                btn.addEventListener('click', () => this.showConfigDialog());

                // Insert before the last separator or at the end
                targetMenu.appendChild(btn);
                
                console.log('[TTS Redirect] Menu button injected');
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }

        /** Show configuration dialog */
        showConfigDialog() {
            // Remove existing dialog
            const existing = document.getElementById('tts-redirect-dialog');
            if (existing) existing.remove();

            const dialog = document.createElement('div');
            dialog.id = 'tts-redirect-dialog';
            dialog.innerHTML = `
                <style>
                    #tts-redirect-dialog * { box-sizing: border-box; }
                    #tts-redirect-dialog input:focus { 
                        outline: none; 
                        border-color: #3b82f6 !important; 
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }
                    @keyframes tts-fadeIn { 
                        from { opacity: 0; transform: translateY(-10px); } 
                        to { opacity: 1; transform: translateY(0); } 
                    }
                    #tts-redirect-dialog .dialog-content {
                        animation: tts-fadeIn 0.2s ease-out;
                    }
                </style>
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                            background: rgba(0,0,0,0.6); z-index: 999999; display: flex; 
                            align-items: center; justify-content: center; 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"
                     class="backdrop">
                    <div class="dialog-content"
                         style="background: white; dark:bg-slate-800; padding: 32px; 
                                border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
                                min-width: 500px; max-width: 600px; width: 90%;">
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 32px; margin-right: 12px;">🎙️</span>
                            <h2 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                                TTS API Configuration
                            </h2>
                        </div>
                        
                        <p style="margin: 0 0 24px 44px; color: #666; font-size: 14px;">
                            Configure custom Text-to-Speech API endpoint
                        </p>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; 
                                          color: #333; font-size: 14px;">
                                API URL
                            </label>
                            <input type="text" id="tts-api-url" 
                                   placeholder="https://api.example.com/v1/audio/speech"
                                   value="${this.apiUrl || ''}"
                                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; 
                                          border-radius: 8px; font-size: 14px; transition: all 0.2s;">
                        </div>
                        
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; 
                                          color: #333; font-size: 14px;">
                                API Key
                            </label>
                            <div style="position: relative;">
                                <input type="password" id="tts-api-key" 
                                       placeholder="sk-xxxxxxxxxxxxx"
                                       value="${this.apiKey || ''}"
                                       style="width: 100%; padding: 12px; padding-right: 40px; 
                                              border: 2px solid #e5e7eb; border-radius: 8px; 
                                              font-size: 14px; transition: all 0.2s;">
                                <button id="tts-toggle-key" type="button"
                                        style="position: absolute; right: 8px; top: 50%; 
                                               transform: translateY(-50%); padding: 4px; 
                                               background: none; border: none; cursor: pointer;
                                               color: #6b7280; transition: color 0.2s;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                    </svg>
                                </button>
                            </div>
                            <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
                                💡 Stored locally in your browser
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 12px;">
                            <button id="tts-save-btn" 
                                    style="flex: 1; padding: 14px; background: #3b82f6; color: white; 
                                           border: none; border-radius: 8px; cursor: pointer; 
                                           font-weight: 600; font-size: 15px; transition: all 0.2s;">
                                💾 Save & Enable
                            </button>
                            <button id="tts-cancel-btn" 
                                    style="padding: 14px 24px; background: #f3f4f6; color: #6b7280; 
                                           border: none; border-radius: 8px; cursor: pointer; 
                                           font-weight: 600; font-size: 15px; transition: all 0.2s;">
                                Cancel
                            </button>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 16px; background: #f0f9ff; 
                                    border-left: 4px solid #3b82f6; border-radius: 4px; 
                                    font-size: 13px; color: #1e3a8a; line-height: 1.6;">
                            <strong>ℹ️ How it works:</strong><br>
                            • Intercepts TTS requests to OpenAI<br>
                            • Redirects to your custom API endpoint<br>
                            • Configuration saved in browser localStorage<br>
                            • Access via "More actions" menu
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            // Elements
            const urlInput = document.getElementById('tts-api-url');
            const keyInput = document.getElementById('tts-api-key');
            const toggleBtn = document.getElementById('tts-toggle-key');
            const saveBtn = document.getElementById('tts-save-btn');
            const cancelBtn = document.getElementById('tts-cancel-btn');
            const backdrop = dialog.querySelector('.backdrop');

            // Toggle password visibility
            toggleBtn.addEventListener('click', () => {
                const type = keyInput.type === 'password' ? 'text' : 'password';
                keyInput.type = type;
                toggleBtn.style.color = type === 'text' ? '#3b82f6' : '#6b7280';
            });

            // Hover effects
            saveBtn.addEventListener('mouseenter', () => saveBtn.style.background = '#2563eb');
            saveBtn.addEventListener('mouseleave', () => saveBtn.style.background = '#3b82f6');
            cancelBtn.addEventListener('mouseenter', () => cancelBtn.style.background = '#e5e7eb');
            cancelBtn.addEventListener('mouseleave', () => cancelBtn.style.background = '#f3f4f6');

            // Save configuration
            saveBtn.addEventListener('click', () => {
                const url = urlInput.value.trim();
                const key = keyInput.value.trim();

                if (!url || !key) {
                    alert('⚠️ Please fill in both fields');
                    return;
                }

                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    alert('⚠️ API URL must start with http:// or https://');
                    return;
                }

                this.saveConfig(url, key);
                dialog.remove();

                if (confirm('✅ Configuration saved!\n\nRefresh the page to activate?')) {
                    location.reload();
                }
            });

            // Cancel
            cancelBtn.addEventListener('click', () => dialog.remove());
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) dialog.remove();
            });

            // ESC key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    dialog.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);

            // Auto-focus
            setTimeout(() => urlInput.focus(), 100);
        }
    }

    // Bootstrap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new TTSRedirect());
    } else {
        new TTSRedirect();
    }

    console.log('[TTS Redirect] Plugin loaded v3.0');
})();

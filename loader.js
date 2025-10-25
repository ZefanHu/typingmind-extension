// TypingMind TTS API 重定向加载器
// 版本：2.0 - 使用本地存储配置
(function() {
    'use strict';
    
    const CONFIG_KEYS = {
        API_URL: 'tm_tts_api_url',
        API_KEY: 'tm_tts_api_key',
        CONFIGURED: 'tm_tts_configured'
    };
    
    // 读取配置
    function getConfig() {
        return {
            apiUrl: localStorage.getItem(CONFIG_KEYS.API_URL),
            apiKey: localStorage.getItem(CONFIG_KEYS.API_KEY),
            configured: localStorage.getItem(CONFIG_KEYS.CONFIGURED) === 'true'
        };
    }
    
    // 保存配置
    function saveConfig(apiUrl, apiKey) {
        localStorage.setItem(CONFIG_KEYS.API_URL, apiUrl);
        localStorage.setItem(CONFIG_KEYS.API_KEY, apiKey);
        localStorage.setItem(CONFIG_KEYS.CONFIGURED, 'true');
    }
    
    // 显示配置对话框
    function showConfigDialog() {
        const existingDialog = document.getElementById('tm-tts-config-dialog');
        if (existingDialog) return;
        
        const config = getConfig();
        
        const dialog = document.createElement('div');
        dialog.id = 'tm-tts-config-dialog';
        dialog.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                        background: rgba(0,0,0,0.6); z-index: 999998; display: flex; 
                        align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="background: white; padding: 32px; border-radius: 16px; 
                            box-shadow: 0 8px 32px rgba(0,0,0,0.3); min-width: 450px; max-width: 90%;">
                    <h2 style="margin: 0 0 24px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                        🎙️ TTS API 配置
                    </h2>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">
                            API URL
                        </label>
                        <input type="text" id="tm-tts-url" 
                               placeholder="https://api.example.com/v1/audio/speech"
                               value="${config.apiUrl || ''}"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; 
                                      border-radius: 8px; box-sizing: border-box; font-size: 14px;
                                      transition: border-color 0.2s;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">
                            API Key
                        </label>
                        <input type="password" id="tm-tts-key" 
                               placeholder="sk-xxxxxxxxxxxxx"
                               value="${config.apiKey || ''}"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; 
                                      border-radius: 8px; box-sizing: border-box; font-size: 14px;
                                      transition: border-color 0.2s;">
                        <div style="margin-top: 8px; font-size: 12px; color: #666;">
                            💡 提示：可以从你的原始配置中复制
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button id="tm-tts-save" 
                                style="flex: 1; padding: 14px; background: #0066cc; color: white; 
                                       border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
                                       font-size: 15px; transition: background 0.2s;">
                            保存并启用
                        </button>
                        <button id="tm-tts-cancel" 
                                style="padding: 14px 24px; background: #f5f5f5; color: #666; 
                                       border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
                                       font-size: 15px; transition: background 0.2s;">
                            取消
                        </button>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 16px; background: #f8f9fa; 
                                border-radius: 8px; font-size: 13px; color: #555; line-height: 1.6;">
                        <strong>🔒 隐私说明：</strong><br>
                        • 配置保存在浏览器本地存储<br>
                        • 不会上传到任何服务器<br>
                        • 快捷键 <code style="background: white; padding: 2px 6px; border-radius: 4px;">Ctrl+Shift+T</code> 可重新打开配置
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 输入框焦点效果
        const inputs = dialog.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.style.borderColor = '#0066cc';
            });
            input.addEventListener('blur', (e) => {
                e.target.style.borderColor = '#e0e0e0';
            });
        });
        
        // 按钮悬停效果
        const saveBtn = document.getElementById('tm-tts-save');
        saveBtn.addEventListener('mouseenter', () => {
            saveBtn.style.background = '#0052a3';
        });
        saveBtn.addEventListener('mouseleave', () => {
            saveBtn.style.background = '#0066cc';
        });
        
        const cancelBtn = document.getElementById('tm-tts-cancel');
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#e8e8e8';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = '#f5f5f5';
        });
        
        // 保存按钮
        document.getElementById('tm-tts-save').onclick = () => {
            const url = document.getElementById('tm-tts-url').value.trim();
            const key = document.getElementById('tm-tts-key').value.trim();
            
            if (!url || !key) {
                alert('⚠️ 请填写完整的配置信息');
                return;
            }
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                alert('⚠️ API URL 必须以 http:// 或 https:// 开头');
                return;
            }
            
            saveConfig(url, key);
            dialog.remove();
            
            // 显示成功提示
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 999999;
                background: #4CAF50; color: white; padding: 16px 24px;
                border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                font-weight: 600; animation: slideIn 0.3s ease-out;
            `;
            toast.textContent = '✅ 配置已保存，刷新页面生效';
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
            
            // 询问是否立即刷新
            if (confirm('配置已保存！是否立即刷新页面使其生效？')) {
                location.reload();
            }
        };
        
        // 取消按钮
        document.getElementById('tm-tts-cancel').onclick = () => {
            dialog.remove();
        };
        
        // ESC 键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                dialog.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    // 核心重定向逻辑
    function initRedirect(apiUrl, apiKey) {
        const originalFetch = window.fetch;
        
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input?.url;
            
            if (url?.includes('audio/speech') && url.includes('openai.com')) {
                const newUrl = url.replace(
                    /https:\/\/api\.openai\.com\/v1\/audio\/speech/g,
                    apiUrl
                );
                
                const newInit = { ...(init || {}) };
                newInit.headers = { 
                    ...(newInit.headers || {}), 
                    Authorization: `Bearer ${apiKey}` 
                };
                
                console.log('🎙️ [TTS重定向]', {
                    original: url,
                    redirected: newUrl,
                    timestamp: new Date().toISOString()
                });
                
                return originalFetch(newUrl, newInit);
            }
            
            return originalFetch(input, init);
        };
        
        // 拦截 axios
        if (window.axios?.post) {
            const originalPost = window.axios.post;
            window.axios.post = function(url, data, config) {
                if (url?.includes('audio/speech') && url.includes('openai.com')) {
                    config = { 
                        ...(config || {}), 
                        headers: { 
                            ...config?.headers, 
                            Authorization: `Bearer ${apiKey}` 
                        } 
                    };
                    console.log('🎙️ [TTS重定向] axios');
                    return originalPost.call(this, apiUrl, data, config);
                }
                return originalPost.call(this, url, data, config);
            };
        }
        
        console.log('✅ TTS 重定向已启用 | API:', apiUrl.replace(/^(https?:\/\/[^\/]+).*/, '$1/...'));
    }
    
    // 主程序
    const config = getConfig();
    
    if (!config.configured || !config.apiUrl || !config.apiKey) {
        console.log('⚙️ TTS 重定向未配置，按 Ctrl+Shift+T 打开配置');
        // 3秒后自动显示配置对话框
        setTimeout(() => {
            showConfigDialog();
        }, 2000);
    } else {
        initRedirect(config.apiUrl, config.apiKey);
    }
    
    // 快捷键 Ctrl+Shift+T 打开配置
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            showConfigDialog();
        }
    });
    
    // 暴露全局方法（用于调试）
    window.TM_TTS = {
        showConfig: showConfigDialog,
        getConfig: getConfig,
        clearConfig: () => {
            Object.values(CONFIG_KEYS).forEach(key => localStorage.removeItem(key));
            console.log('🗑️ 配置已清除');
        }
    };
    
})();

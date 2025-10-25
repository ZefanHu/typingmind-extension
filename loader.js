// TypingMind TTS API 重定向加载器 v2.1
// 修复：快捷键冲突、重复加载、劫持时机问题
(function() {
    'use strict';
    
    // 防止重复加载
    if (window.__TM_TTS_LOADED__) {
        console.log('⚠️ TTS 重定向已加载，跳过重复执行');
        return;
    }
    window.__TM_TTS_LOADED__ = true;
    
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
        // 移除已存在的对话框
        const existingDialog = document.getElementById('tm-tts-config-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        const config = getConfig();
        
        const dialog = document.createElement('div');
        dialog.id = 'tm-tts-config-dialog';
        dialog.innerHTML = `
            <style>
                #tm-tts-config-dialog * { box-sizing: border-box; }
                #tm-tts-config-dialog input:focus { outline: none; border-color: #0066cc !important; }
                @keyframes tm-fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            </style>
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                        background: rgba(0,0,0,0.7); z-index: 2147483647; display: flex; 
                        align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="background: white; padding: 32px; border-radius: 16px; 
                            box-shadow: 0 8px 32px rgba(0,0,0,0.3); min-width: 500px; max-width: 90%;
                            animation: tm-fadeIn 0.3s ease-out;">
                    <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                        🎙️ TTS API 配置
                    </h2>
                    <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">
                        配置自定义的语音合成 API 端点
                    </p>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">
                            API URL
                        </label>
                        <input type="text" id="tm-tts-url" 
                               placeholder="https://api.example.com/v1/audio/speech"
                               value="${config.apiUrl || ''}"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; 
                                      border-radius: 8px; font-size: 14px; transition: border-color 0.2s;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">
                            API Key
                        </label>
                        <input type="password" id="tm-tts-key" 
                               placeholder="sk-xxxxxxxxxxxxx"
                               value="${config.apiKey || ''}"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; 
                                      border-radius: 8px; font-size: 14px; transition: border-color 0.2s;">
                        <label style="display: flex; align-items: center; margin-top: 8px; cursor: pointer; font-size: 13px; color: #666;">
                            <input type="checkbox" id="tm-tts-show-key" style="margin-right: 6px;">
                            显示密钥
                        </label>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button id="tm-tts-save" 
                                style="flex: 1; padding: 14px; background: #0066cc; color: white; 
                                       border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
                                       font-size: 15px; transition: all 0.2s;">
                            💾 保存配置
                        </button>
                        <button id="tm-tts-cancel" 
                                style="padding: 14px 24px; background: #f5f5f5; color: #666; 
                                       border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
                                       font-size: 15px; transition: all 0.2s;">
                            取消
                        </button>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 16px; background: #f0f7ff; 
                                border-left: 4px solid #0066cc; border-radius: 4px; font-size: 13px; color: #555; line-height: 1.6;">
                        <strong>💡 使用说明：</strong><br>
                        • 配置保存在浏览器本地，不会上传<br>
                        • 快捷键 <kbd style="background: white; padding: 2px 8px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace;">Ctrl+Alt+C</kbd> 重新打开配置<br>
                        • 保存后需要<strong>刷新页面</strong>才能生效
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 显示/隐藏密钥
        const keyInput = document.getElementById('tm-tts-key');
        const showKeyCheckbox = document.getElementById('tm-tts-show-key');
        showKeyCheckbox.addEventListener('change', (e) => {
            keyInput.type = e.target.checked ? 'text' : 'password';
        });
        
        // 按钮悬停效果
        const saveBtn = document.getElementById('tm-tts-save');
        saveBtn.addEventListener('mouseenter', () => saveBtn.style.background = '#0052a3');
        saveBtn.addEventListener('mouseleave', () => saveBtn.style.background = '#0066cc');
        
        const cancelBtn = document.getElementById('tm-tts-cancel');
        cancelBtn.addEventListener('mouseenter', () => cancelBtn.style.background = '#e8e8e8');
        cancelBtn.addEventListener('mouseleave', () => cancelBtn.style.background = '#f5f5f5');
        
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
            
            // 显示成功提示并刷新
            if (confirm('✅ 配置已保存！\n\n需要刷新页面才能生效，现在刷新吗？')) {
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
        
        // 自动聚焦第一个输入框
        setTimeout(() => document.getElementById('tm-tts-url').focus(), 100);
    }
    
    // 核心重定向逻辑（必须在页面脚本执行前运行）
    function initRedirect(apiUrl, apiKey) {
        console.log('🔧 正在初始化 TTS 重定向...');
        
        // 保存原始 fetch
        const originalFetch = window.fetch;
        
        // 重写 fetch
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input?.url;
            
            // 检测 TTS 请求
            if (url && url.includes('/audio/speech')) {
                console.log('🎯 检测到 TTS 请求:', url);
                
                // 替换 URL
                const newUrl = url.replace(
                    /https:\/\/api\.openai\.com\/v1\/audio\/speech/g,
                    apiUrl
                );
                
                // 复制并修改 headers
                const newInit = { ...(init || {}) };
                newInit.headers = new Headers(newInit.headers || {});
                newInit.headers.set('Authorization', `Bearer ${apiKey}`);
                
                console.log('✅ TTS 请求已重定向:', {
                    from: url,
                    to: newUrl,
                    time: new Date().toISOString()
                });
                
                return originalFetch.call(this, newUrl, newInit);
            }
            
            // 其他请求正常处理
            return originalFetch.call(this, input, init);
        };
        
        // 拦截 axios（如果存在）
        const checkAxios = () => {
            if (window.axios?.post) {
                const originalPost = window.axios.post;
                window.axios.post = function(url, data, config) {
                    if (url && url.includes('/audio/speech')) {
                        console.log('🎯 检测到 axios TTS 请求:', url);
                        config = { 
                            ...(config || {}), 
                            headers: { 
                                ...config?.headers, 
                                Authorization: `Bearer ${apiKey}` 
                            } 
                        };
                        console.log('✅ axios 请求已重定向');
                        return originalPost.call(this, apiUrl, data, config);
                    }
                    return originalPost.call(this, url, data, config);
                };
                console.log('✅ axios 拦截器已安装');
            } else {
                // axios 可能还未加载，稍后重试
                setTimeout(checkAxios, 500);
            }
        };
        checkAxios();
        
        console.log('✅ TTS 重定向已启用');
        console.log('   API 端点:', apiUrl);
        console.log('   快捷键: Ctrl+Alt+C 打开配置');
    }
    
    // 主程序
    const config = getConfig();
    
    if (!config.configured || !config.apiUrl || !config.apiKey) {
        console.log('⚙️ TTS 重定向未配置');
        
        // 等待 DOM 加载后显示配置
        if (document.body) {
            setTimeout(() => showConfigDialog(), 1000);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => showConfigDialog(), 1000);
            });
        }
    } else {
        // 立即初始化重定向（在页面脚本执行前）
        initRedirect(config.apiUrl, config.apiKey);
    }
    
    // 快捷键 Ctrl+Alt+C 打开配置（修复冲突）
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'c') {
            e.preventDefault();
            showConfigDialog();
        }
    });
    
    // 暴露全局方法
    window.TM_TTS = {
        showConfig: showConfigDialog,
        getConfig: getConfig,
        clearConfig: () => {
            Object.values(CONFIG_KEYS).forEach(key => localStorage.removeItem(key));
            alert('🗑️ 配置已清除，刷新页面后生效');
            location.reload();
        },
        version: '2.1'
    };
    
    console.log('📦 TTS 重定向扩展加载完成 v2.1');
})();

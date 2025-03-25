// typingmind-api-redirect.js (更新版)
(function() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(input, init) {
        // 精确替换为新地址
        if (typeof input === 'string' && input.startsWith('https://api.openai.com/v1/audio/speech')) {
            const newUrl = input.replace(
                'https://api.openai.com/v1/audio/speech',
                'https://api.ephone.ai/v1/audio/speech'  // ← 这里修改
            );
            
            console.log('[扩展] 新请求地址:', newUrl);
            return originalFetch.call(window, newUrl, init); // 保持所有headers和body
        }
        return originalFetch.apply(this, arguments);
    };

    // 同步修改axios部分
    if (window.axios?.post) {
        const originalAxiosPost = window.axios.post;
        window.axios.post = function(url, data, config) {
            const newUrl = url.replace(
                'https://api.openai.com/v1/audio/speech',
                'https://api.ephone.ai/v1/audio/speech'  // ← 这里同步修改
            );
            return originalAxiosPost.call(this, newUrl, data, config);
        };
    }

    console.log('[扩展] 新版域名替换器已激活');
})();

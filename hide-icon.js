// typingmind-api-redirect.js
(function() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(input, init) {
        // 仅替换目标域名
        if (typeof input === 'string' && input.startsWith('https://api.openai.com')) {
            const newUrl = input.replace(
                'https://api.openai.com/v1/audio/speech',
                'https://api.aptzone.cc/ephone/audio/speech'
            );
            
            console.log('[扩展] 请求已重定向:', newUrl);
            return originalFetch.call(window, newUrl, init); // 关键：init参数原样传递
        }
        
        return originalFetch.apply(this, arguments);
    };

    // axios覆盖（如果存在）
    if (window.axios?.post) {
        const originalAxiosPost = window.axios.post;
        window.axios.post = function(url, data, config) {
            const newUrl = url.replace(
                'https://api.openai.com/v1/audio/speech',
                'https://api.aptzone.cc/ephone/audio/speech'
            );
            return originalAxiosPost.call(this, newUrl, data, config); // 配置原样传递
        };
    }

    console.log('[扩展] OpenAI域名替换器已加载');
})();

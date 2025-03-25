// typingmind-api-redirect.js
(function() {
    const NEW_API_URL = 'https://new-api.aptzone.cc/v1/audio/speech';
    const NEW_API_KEY = 'sk-Sy6zHMKZc5vWUXb1v8eifMiOOEpoUL4C6hU7ZBHKHlGIzowl';

    // 覆盖 fetch
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
        if (typeof input === 'string' && input.includes('audio/speech')) {
            // 修改 URL
            const newUrl = input.replace(
                'https://api.openai.com/v1/audio/speech',
                NEW_API_URL
            );
            // 克隆 init 对象避免污染原始配置
            const newInit = init ? { ...init } : {};
            newInit.headers = { ...newInit.headers };
            // 更新认证头
            newInit.headers.Authorization = `Bearer ${NEW_API_KEY}`;
            console.log('[扩展] 修改请求:', { url: newUrl, headers: newInit.headers });
            return originalFetch(newUrl, newInit);
        }
        return originalFetch(input, init);
    };

    // 覆盖 axios
    if (window.axios?.post) {
        const originalPost = window.axios.post;
        window.axios.post = (url, data, config) => {
            if (url.includes('audio/speech')) {
                url = NEW_API_URL;
                config = config || {};
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${NEW_API_KEY}`
                };
            }
            return originalPost(url, data, config);
        };
    }

    console.log('[扩展] API 重定向器已加载');
})();

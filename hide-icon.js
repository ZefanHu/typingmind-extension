// typingmind-api-redirect.js
(function() {
    const NEW_API_URL = 'https://api.siliconflow.cn/v1/audio/speech';
    const NEW_API_KEY = 'sk-riodfdvvhzbaiczsjlclayloebbhigspcxhycqvcqjrecmmi';

    // 劫持fetch方法
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        if (typeof input === 'string' && input.includes('/audio/speech')) {
            // 替换URL
            const newUrl = input.replace(
                'https://api.openai.com/v1/audio/speech', 
                NEW_API_URL
            );
            
            // 克隆请求配置
            const newInit = init ? {...init} : {};
            newInit.headers = {...newInit.headers};
            
            // 替换认证密钥
            if (newInit.headers.Authorization) {
                newInit.headers.Authorization = `Bearer ${NEW_API_KEY}`;
            }
            
            console.log('[扩展] 修改请求至:', newUrl);
            return originalFetch.call(window, newUrl, newInit);
        }
        return originalFetch.apply(this, arguments);
    };

    // 劫持axios方法
    if (window.axios?.post) {
        const originalAxiosPost = window.axios.post;
        window.axios.post = function(url, data, config) {
            if (url.includes('/audio/speech')) {
                const newUrl = url.replace(
                    'https://api.openai.com/v1/audio/speech',
                    NEW_API_URL
                );
                config = config || {};
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${NEW_API_KEY}`
                };
                console.log('[扩展] 修改axios请求至:', newUrl);
                return originalAxiosPost.call(this, newUrl, data, config);
            }
            return originalAxiosPost.apply(this, arguments);
        };
    }

    console.log('[扩展] 新版API重定向器已加载');
})();

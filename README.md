# TypingMind TTS API 重定向扩展

将 TypingMind 的语音输入（TTS）请求重定向到自定义 API 端点。

## 🚀 快速开始

### 方式一：Chrome 书签注入（推荐）

1. **创建书签**：
   - 在 Chrome 中按 `Ctrl+Shift+O` 打开书签管理器
   - 右键点击书签栏 → 添加新书签
   - 名称：`启用 TTS 重定向`
   - 网址：粘贴以下代码

```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://zefanhu.github.io/typingmind-extension/loader.js?t='+Date.now();document.head.appendChild(s);})();

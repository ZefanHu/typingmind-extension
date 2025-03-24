const hideSpecificButtons = () => {
  // 通过data-element-id隐藏Teams和Prompts按钮
  const buttonsToHide = [
    '[data-element-id="workspace-tab-teams"]',
    '[data-element-id="workspace-tab-prompts"]'
  ];
  
  // 为KB按钮创建一个特定的选择器（通过其独特的SVG结构和文本内容匹配）
  const kbButtonSelector = 'button:has(span:has(svg[viewBox="0 0 24 24"]:has(path[d*="M7 14H4"])) + span:contains("KB"))';
  
  // 隐藏带有data-element-id的按钮
  buttonsToHide.forEach(selector => {
    const button = document.querySelector(selector);
    if (button) {
      button.style.display = 'none';
    }
  });
  
  // 隐藏KB按钮 - 使用更具体的选择器
  const kbButton = document.querySelector('button:has(span:has(svg[viewBox="0 0 24 24"]) + span:contains("KB"))');
  if (kbButton && !kbButton.hasAttribute('data-element-id')) {
    kbButton.style.display = 'none';
  }
};

// 立即运行
hideSpecificButtons();

// 延迟运行以确保UI完全加载
setTimeout(hideSpecificButtons, 1000);

// 为了确保在动态加载的情况下也能工作，可以添加一个观察器
const observer = new MutationObserver(() => {
  hideSpecificButtons();
});

// 观察整个document.body的变化
observer.observe(document.body, {
  childList: true,
  subtree: true
});

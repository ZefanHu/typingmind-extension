const hideSpecificButtons = () => {
  // 隐藏指定的三个按钮
  const buttonsToHide = [
    // 使用属性选择器匹配前两个按钮
    '[data-element-id="workspace-tab-teams"]',
    '[data-element-id="workspace-tab-prompts"]',
    // 使用更具体的选择器匹配第三个KB按钮
    'button:not([data-element-id]) span svg[viewBox="0 0 24 24"] + span:contains("KB")'
  ];

  // 创建一个样式标签
  const style = document.createElement('style');
  style.textContent = `
    [data-element-id="workspace-tab-teams"],
    [data-element-id="workspace-tab-prompts"],
    button:has(span svg + span:contains("KB")):not([data-element-id="cloud-sync-button"]) {
      display: none !important;
    }
    
    /* 确保cloud-sync-button显示 */
    [data-element-id="cloud-sync-button"] {
      display: flex !important;
    }
  `;
  
  document.head.appendChild(style);
};

// 立即执行
hideSpecificButtons();

// 延迟执行以确保UI完全加载
setTimeout(hideSpecificButtons, 1000);

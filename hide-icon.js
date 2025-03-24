const hideElements = () => {
  // 隐藏 Teams 按钮
  const teamsButton = document.querySelector('[data-element-id="workspace-tab-teams"]');
  if (teamsButton) {
    teamsButton.style.display = 'none';
  }
  
  // 隐藏 Prompts 按钮
  const promptsButton = document.querySelector('[data-element-id="workspace-tab-prompts"]');
  if (promptsButton) {
    promptsButton.style.display = 'none';
  }
  
  // 隐藏 KB 按钮（通过SVG和文本内容匹配）
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(button => {
    const spanWithKB = button.querySelector('span.text-xs');
    if (spanWithKB && spanWithKB.textContent === 'KB') {
      button.style.display = 'none';
    }
  });
};

// 立即运行
hideElements();

// 延迟运行以确保UI完全加载
setTimeout(hideElements, 1000);

// 为了应对动态加载的UI，可以设置一个观察器
const observer = new MutationObserver(hideElements);
observer.observe(document.body, { childList: true, subtree: true });

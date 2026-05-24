const hidePromptsButton = () => {
  console.log('正在尝试隐藏Prompts按钮...'); // 添加日志
  const promptsButton = document.querySelector('[data-element-id="workspace-tab-prompts"]');
  
  if (promptsButton) {
    console.log('找到Prompts按钮，正在隐藏...'); // 找到元素时的日志
    promptsButton.style.display = 'none';
  } else {
    console.warn('未找到Prompts按钮元素'); // 未找到元素时的警告
  }
};

console.log('首次执行隐藏函数');
hidePromptsButton();

// 使用更合理的延迟检查
const retryInterval = setInterval(() => {
  console.log('定时检查Prompts按钮...');
  const button = document.querySelector('[data-element-id="workspace-tab-prompts"]');
  if (button) {
    hidePromptsButton();
    clearInterval(retryInterval); // 找到后清除定时器
  }
}, 1000);

// 10秒后最终检查并清除定时器
setTimeout(() => {
  clearInterval(retryInterval);
  console.log('最终检查Prompts按钮');
  hidePromptsButton();
}, 10000);

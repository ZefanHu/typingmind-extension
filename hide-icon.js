const hideKBButton = () => {
  // 方案1：通过文本内容 "KB" 来定位按钮
  const kbButton = Array.from(document.querySelectorAll('button')).find(
    button => button.textContent.trim() === 'KB'
  );
  
  if (kbButton) {
    kbButton.style.display = 'none';
  }
};

// 立即执行一次
hideKBButton();

// 延迟执行一次以确保UI加载完成
setTimeout(hideKBButton, 1000);

const hideTeamsButton = () => {
  const teamsButton = document.querySelector('[data-element-id="workspace-tab-prompts"]');
  if (teamsButton) {
    teamsButton.style.display = 'none';
  }
};

// 立即执行一次
hideTeamsButton();

// 延迟执行一次以确保UI加载完成
setTimeout(hideTeamsButton, 2000);

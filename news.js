// 本地新闻数据
const localNews = [
    {
        date: '2023-11-20',
        title: '大学生心理健康：如何应对期末考试压力',
        description: '专家分享科学的压力管理方法，帮助学生平稳度过考试季...',
        url: 'http://www.xinli110.com/news/latest'
    },
    {
        date: '2023-11-18',
        title: '睡眠质量与心理健康的关系研究',
        description: '最新研究发现：良好的睡眠习惯对心理健康的重要影响...',
        url: 'http://www.xinli110.com/news/latest'
    },
    {
        date: '2023-11-15',
        title: '社交媒体对青少年心理的影响',
        description: '如何在数字时代保持健康的社交媒体使用习惯...',
        url: 'http://www.xinli110.com/news/latest'
    },
    {
        date: '2023-11-13',
        title: '冬季心理调适指南',
        description: '专业心理咨询师教你如何应对冬季情绪波动，保持积极心态...',
        url: 'http://www.xinli110.com/news/latest'
    }
];

// 更新新闻显示
function updateNewsDisplay() {
    const newsList = document.querySelector('.news-list');
    if (!newsList) return;
    
    newsList.innerHTML = localNews.map(news => `
        <a href="${news.url}" 
           target="_blank" 
           class="news-item">
            <span class="news-date">${news.date}</span>
            <h3>${news.title}</h3>
            <p>${news.description}</p>
        </a>
    `).join('');
}

// 定期更新新闻（这里只是模拟更新）
function startNewsUpdateInterval() {
    updateNewsDisplay();
    // 每30分钟更新一次新闻显示
    setInterval(updateNewsDisplay, 30 * 60 * 1000);
}

// 页面加载时启动新闻更新
document.addEventListener('DOMContentLoaded', startNewsUpdateInterval); 
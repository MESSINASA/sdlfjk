// 管理员面板功能
let isAdminMode = false;

// 监听快捷键
document.addEventListener('keydown', function(event) {
    // 检测 Ctrl + Alt + S
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault(); // 阻止默认保存行为
        toggleAdminPanel();
    }
});

// 切换管理员面板
function toggleAdminPanel() {
    isAdminMode = !isAdminMode;
    const adminPanel = document.getElementById('admin-panel');
    
    if (isAdminMode) {
        if (!adminPanel) {
            showAdminPanel();
        } else {
            adminPanel.style.right = '0';
        }
    } else {
        if (adminPanel) {
            adminPanel.style.right = '-100%';
        }
    }
}

// 显示管理员面板
function showAdminPanel() {
    // 创建管理员面板
    const adminPanel = document.createElement('div');
    adminPanel.id = 'admin-panel';
    adminPanel.className = 'admin-panel';
    
    // 获取所有用户数据
    const allUserData = getAllUserData();
    
    adminPanel.innerHTML = `
        <div class="admin-header">
            <h2>管理员面板</h2>
            <button onclick="toggleAdminPanel()" class="close-admin" title="关闭面板">×</button>
        </div>
        <div class="admin-content">
            <div class="admin-stats">
                <h3>总体统计</h3>
                <p>总测试次数：${allUserData.totalTests}</p>
                <p>平均分数：${allUserData.averageScore.toFixed(2)}</p>
                <p>最近30天测试数：${allUserData.recentTests}</p>
            </div>
            <div class="admin-chart">
                <h3>全局趋势分析</h3>
                <canvas id="adminChart"></canvas>
            </div>
            <div class="admin-history">
                <h3>所有测试记录</h3>
                <div class="admin-history-list">
                    ${generateHistoryHTML(allUserData.history)}
                </div>
            </div>
            <div class="admin-export">
                <button onclick="exportAllData()" class="primary-button">导出所有数据</button>
                <button onclick="clearAllHistory()" class="danger-button">清空所有记录</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
    
    // 初始化管理员图表
    setTimeout(() => {
        initAdminChart(allUserData.chartData);
    }, 100);
}

// 隐藏管理员面板
function hideAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.style.right = '-100%'; // 先移动到屏幕外
        setTimeout(() => {
            adminPanel.remove(); // 等动画结束后移除
        }, 300);
    }
    isAdminMode = false;
}

// 获取所有用户数据
function getAllUserData() {
    const allHistory = JSON.parse(localStorage.getItem('psychological_test_history') || '[]');
    
    // 计算统计数据
    const totalTests = allHistory.length;
    const totalScore = allHistory.reduce((sum, test) => sum + test.score, 0);
    const averageScore = totalTests > 0 ? totalScore / totalTests : 0;
    
    // 计算最近30天的测试数量
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTests = allHistory.filter(test => 
        new Date(test.date) > thirtyDaysAgo
    ).length;
    
    // 准备图表数据
    const chartData = prepareChartData(allHistory);
    
    return {
        totalTests,
        averageScore,
        recentTests,
        history: allHistory,
        chartData
    };
}

// 准备图表数据
function prepareChartData(history) {
    // 按日期分组并计算平均分
    const dailyData = {};
    history.forEach(test => {
        const date = new Date(test.date).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                total: 0,
                count: 0
            };
        }
        dailyData[date].total += test.score;
        dailyData[date].count += 1;
    });
    
    // 转换为图表数据格式
    const dates = Object.keys(dailyData).sort();
    const averages = dates.map(date => 
        dailyData[date].total / dailyData[date].count
    );
    
    return {
        labels: dates,
        data: averages
    };
}

// 生成历史记录HTML
function generateHistoryHTML(history) {
    return history.map(test => `
        <div class="admin-history-item">
            <div class="history-header">
                <div class="history-info">
                    <div class="history-date">${new Date(test.date).toLocaleString()}</div>
                    <div class="history-score">分数：${test.score}</div>
                    <div class="history-level">等级：${test.level}</div>
                </div>
                <button onclick="deleteHistoryItem('${test.date}')" class="delete-button" title="删除记录">
                    <span class="delete-icon">×</span>
                </button>
            </div>
            ${test.notes ? `<div class="history-notes">笔记：${test.notes}</div>` : ''}
        </div>
    `).join('');
}

// 初始化管理员图表
function initAdminChart(chartData) {
    const ctx = document.getElementById('adminChart').getContext('2d');
    
    // 如存在旧的图表实例，先销毁它
    if (window.adminChart instanceof Chart) {
        window.adminChart.destroy();
    }
    
    window.adminChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: '日平均分数',
                data: chartData.data,
                borderColor: 'var(--primary-blue)',
                backgroundColor: 'rgba(26, 115, 232, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 27
                }
            }
        }
    });
}

// 导出所有数据
function exportAllData() {
    const allData = getAllUserData();
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `心理测试数据导出-${new Date().toLocaleDateString()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// 更新管理员面板
function updateAdminPanel() {
    const allUserData = getAllUserData();
    
    // 更新统计数据
    document.querySelector('.admin-stats').innerHTML = `
        <h3>总体统计</h3>
        <p>总测试次数：${allUserData.totalTests}</p>
        <p>平均分数：${allUserData.averageScore.toFixed(2)}</p>
        <p>最近30天测试数：${allUserData.recentTests}</p>
    `;
    
    // 更新历史记录列表
    document.querySelector('.admin-history-list').innerHTML = generateHistoryHTML(allUserData.history);
    
    // 更新图表
    initAdminChart(allUserData.chartData);
}

// 添加清空所有历史记录的功能
function clearAllHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
        localStorage.setItem(HISTORY_KEY, '[]');
        updateAdminPanel();
        updateHistoryList();
        updateTrendChart();
        showToast('所有历史记录已清空');
    }
} 
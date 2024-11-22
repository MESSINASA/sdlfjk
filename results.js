// 结果评估标准
const evaluationStandards = {
    depression: {
        mild: { min: 5, max: 9 },
        moderate: { min: 10, max: 14 },
        severe: { min: 15, max: 27 }
    }
};

// 存储历史记录的键名
const HISTORY_KEY = 'psychological_test_history';

// 显示结果
function showResults() {
    const totalScore = calculateTotalScore();
    const resultLevel = evaluateScore(totalScore);
    
    // 切换显示结果屏幕
    document.getElementById('test-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    
    // 显示结果内容
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="result-category">
            <h3>测评结果</h3>
            <p>总分：${totalScore}</p>
            <p>评估等级：${resultLevel.label}</p>
            <div class="score-bar">
                <div class="score-fill" style="width: ${(totalScore / 27) * 100}%; 
                     background-color: ${resultLevel.color}">
                </div>
            </div>
            <p>${resultLevel.description}</p>
        </div>
    `;

    // 保存结果到历史记录
    saveToHistory(totalScore, resultLevel);
    
    // 更新趋势图表
    updateTrendChart();
}

// 计算总分
function calculateTotalScore() {
    return userAnswers.reduce((sum, score) => sum + score, 0);
}

// 评估分数
function evaluateScore(score) {
    if (score < 5) {
        return {
            label: "正常范围",
            color: "var(--success-color)",
            description: "您的心理状态处于健康范围，请继续保持积极乐观的生活态度。"
        };
    } else if (score <= 9) {
        return {
            label: "轻度",
            color: "var(--warning-color)",
            description: "您可能存在轻微的心理困扰，建议适当关注自己的心理健康。"
        };
    } else if (score <= 14) {
        return {
            label: "中度",
            color: "var(--warning-color)",
            description: "您可能正在经历一些心理困扰，建议寻求专业的心理咨询帮助。"
        };
    } else {
        return {
            label: "重度",
            color: "var(--error-color)",
            description: "您的心理状态可能需要专业帮助，强烈建议尽快寻求心理医生的帮助。"
        };
    }
}

// 显示建议
function showRecommendations() {
    const totalScore = calculateTotalScore();
    const resultLevel = evaluateScore(totalScore);
    
    alert(`基于您的测试结果，我们的建议是：\n${resultLevel.description}`);
}

// 保存结果到历史记录
function saveToHistory(score, resultLevel) {
    const history = getHistory();
    const newResult = {
        date: new Date().toISOString(),
        score: score,
        level: resultLevel.label,
        notes: '',
        categories: getCategoryScores()
    };
    
    history.push(newResult);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    // 更新历史记录显示
    updateHistoryList();
}

// 获取历史记录
function getHistory() {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
}

// 获取各类别得分
function getCategoryScores() {
    const categories = {};
    questions.forEach((question, index) => {
        if (!categories[question.category]) {
            categories[question.category] = {
                total: 0,
                count: 0
            };
        }
        categories[question.category].total += userAnswers[index] || 0;
        categories[question.category].count += 1;
    });

    // 计算每个类别的平均分
    Object.keys(categories).forEach(category => {
        categories[category] = Math.round(categories[category].total / categories[category].count * 100) / 100;
    });

    return categories;
}

// 更新历史记录列表
function updateHistoryList() {
    const historyList = document.getElementById('history-list');
    const history = getHistory();
    
    historyList.innerHTML = history.reverse().slice(0, 5).map((result, index) => `
        <div class="history-card">
            <div class="history-header">
                <span class="history-date">${new Date(result.date).toLocaleDateString()}</span>
                <span class="category-level ${result.level.toLowerCase()}">${result.level}</span>
                <button onclick="deleteHistoryItem('${result.date}')" class="delete-button" title="删除记录">
                    <span class="delete-icon">×</span>
                </button>
            </div>
            <p>总分：${result.score}</p>
            ${Object.entries(result.categories).map(([category, score]) => `
                <div class="category-score">
                    <span>${category}：${score}</span>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// 删除单个历史记录
function deleteHistoryItem(date) {
    if (confirm('确定要删除这条记录吗？')) {
        const history = getHistory();
        const newHistory = history.filter(item => item.date !== date);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        
        // 更新显示
        updateHistoryList();
        updateTrendChart();
        
        // 如果在管理员面板中，也更新管理员面板的显示
        if (isAdminMode) {
            updateAdminPanel();
        }
    }
}

// 更新趋势图表
function updateTrendChart() {
    const history = getHistory();
    updateTrendChartData(history);
}

// 保存笔记
function saveNotes() {
    const notes = document.getElementById('result-notes').value;
    const history = getHistory();
    if (history.length > 0) {
        history[history.length - 1].notes = notes;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
}

// 导出结果
function exportResult() {
    const totalScore = calculateTotalScore();
    const resultLevel = evaluateScore(totalScore);
    const notes = document.getElementById('result-notes').value;
    const categories = getCategoryScores();
    
    const resultText = `
心理健康评估结果
----------------
测试日期：${new Date().toLocaleDateString()}
总分：${totalScore}
评估等级：${resultLevel.label}

类别得分：
${Object.entries(categories).map(([category, score]) => `${category}：${score}`).join('\n')}

个人笔记：${notes}

建议：${resultLevel.description}
    `;
    
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `心理评估结果-${new Date().toLocaleDateString()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// 在页面加载时初始化历史记录和趋势图
document.addEventListener('DOMContentLoaded', function() {
    updateHistoryList();
    updateTrendChart();
    
    // 添加笔记自动保存
    document.getElementById('result-notes').addEventListener('input', saveNotes);
});

// 显示放松技巧
function showRelaxationTips() {
    const tips = [
        "深呼吸：慢慢吸气4秒，屏住4秒，慢慢呼气6秒",
        "渐进性肌肉放松：从脚趾开始，依次绷紧再放松每组肌肉",
        "正念冥想：专注于当下，观察呼吸，不评判任何想法",
        "散步：在户外慢走15-20分钟，感受自然环境",
        "听音乐：选择舒缓的音乐，闭眼静听5-10分钟"
    ];
    
    alert(`简单的放松技巧：\n\n${tips.join('\n\n')}`);
} 
// 图表工具函数
let trendChart = null;

// 初始化趋势图表
function initializeTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) {
        console.error('Trend chart canvas not found');
        return;
    }

    try {
        // 如果已存在图表实例，先销毁它
        if (trendChart instanceof Chart) {
            trendChart.destroy();
        }

        trendChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '总分趋势',
                    data: [],
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
    } catch (error) {
        console.error('Chart initialization error:', error);
    }
}

// 更新趋势图表数据（改名以避免命名冲突）
function updateTrendChartData(history) {
    if (!trendChart) {
        initializeTrendChart();
    }

    try {
        const recentHistory = history.slice(-10);
        
        trendChart.data.labels = recentHistory.map(result => 
            new Date(result.date).toLocaleDateString()
        );
        trendChart.data.datasets[0].data = recentHistory.map(result => 
            result.score
        );
        
        trendChart.update();
    } catch (error) {
        console.error('Error updating trend chart:', error);
    }
}

// 导出函数
window.updateTrendChartData = updateTrendChartData;
window.initializeTrendChart = initializeTrendChart;
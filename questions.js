document.addEventListener('DOMContentLoaded', function() {
    // 检查必要的DOM元素是否存在
    const requiredElements = [
        'home-screen',
        'test-screen',
        'result-screen',
        'question-text',
        'options-container',
        'trendChart'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        alert('页面加载出错，请刷新重试');
        return;
    }

    // 初始化首页
    try {
        document.getElementById('home-screen').classList.add('active');
        // 延迟初始化图表，确保 DOM 完全加载
        setTimeout(() => {
            const history = getHistory(); // 从 results.js 中获取历史记录
            updateTrendChart(history);    // 使用 chart-utils.js 中的函数
            updateHistoryList();
        }, 100);
    } catch (error) {
        console.error('Initialization error:', error);
        alert('初始化失败，请刷新重试');
    }
});

const allQuestions = [
    // 情绪类问题
    {
        id: 1,
        category: "emotion",
        text: "最近两周内，你感到心情低落、沮丧或绝望的频率是？",
        options: [
            { text: "完全没有", score: 0 },
            { text: "有几天", score: 1 },
            { text: "一半以上时间", score: 2 },
            { text: "几乎每天", score: 3 }
        ]
    },
    {
        id: 2,
        category: "emotion",
        text: "最近两周内，你对做事情失去兴趣或乐趣的频率是？",
        options: [
            { text: "完全没有", score: 0 },
            { text: "有几天", score: 1 },
            { text: "一半以上时间", score: 2 },
            { text: "几乎每天", score: 3 }
        ]
    },
    {
        id: 3,
        category: "physical",
        text: "最近两周内，你感到疲倦或精力不足的频率是？",
        options: [
            { text: "完全没有", score: 0 },
            { text: "有几天", score: 1 },
            { text: "一半以上时间", score: 2 },
            { text: "几乎每天", score: 3 }
        ]
    },
    {
        id: 4,
        category: "emotion",
        text: "最近两周内，你感到焦虑���烦躁不安的频率是？",
        options: [
            { text: "完全没有", score: 0 },
            { text: "有几天", score: 1 },
            { text: "一半以上时间", score: 2 },
            { text: "几乎每天", score: 3 }
        ]
    },
    {
        id: 5,
        category: "physical",
        text: "最近两周内，你的睡眠质量如何？",
        options: [
            { text: "很好", score: 0 },
            { text: "偶尔失眠", score: 1 },
            { text: "经常失眠", score: 2 },
            { text: "几乎无法入睡", score: 3 }
        ]
    },
    {
        id: 6,
        category: "social",
        text: "最近两周内，你与他人交往的意愿如何？",
        options: [
            { text: "保持正常社交", score: 0 },
            { text: "略有减少", score: 1 },
            { text: "明显减少", score: 2 },
            { text: "几乎不想社交", score: 3 }
        ]
    },
    {
        id: 7,
        category: "cognitive",
        text: "最近两周内，你在集中注意力方面的困难程度是？",
        options: [
            { text: "没有困难", score: 0 },
            { text: "偶尔分心", score: 1 },
            { text: "经常走神", score: 2 },
            { text: "无���集中", score: 3 }
        ]
    },
    {
        id: 8,
        category: "emotion",
        text: "最近两周内，你对未来的看法如何？",
        options: [
            { text: "充满希望", score: 0 },
            { text: "偶尔担忧", score: 1 },
            { text: "经常悲观", score: 2 },
            { text: "完全绝望", score: 3 }
        ]
    },
    {
        id: 9,
        category: "physical",
        text: "最近两周内，你的食欲状况如何？",
        options: [
            { text: "正常", score: 0 },
            { text: "略有变化", score: 1 },
            { text: "明显改变", score: 2 },
            { text: "极度改变", score: 3 }
        ]
    },
    {
        id: 10,
        category: "cognitive",
        text: "最近两周内，你做决定时的困难程度是？",
        options: [
            { text: "没有困难", score: 0 },
            { text: "偶尔犹豫", score: 1 },
            { text: "经常难决定", score: 2 },
            { text: "完全无法决定", score: 3 }
        ]
    }
];

let questions = []; // 当前测试使用的问题
let currentQuestionIndex = 0;
let userAnswers = [];

// 从每个类别中随机选择问题
function selectRandomQuestions() {
    const categories = ["emotion", "physical", "social", "cognitive"];
    const selectedQuestions = [];
    
    // 确保每个类别至少选择一个问题
    categories.forEach(category => {
        const categoryQuestions = allQuestions.filter(q => q.category === category);
        if (categoryQuestions.length > 0) {
            const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
            selectedQuestions.push(randomQuestion);
        }
    });
    
    // 随机补充问题直到达到目标数量（比如6题）
    const remainingQuestions = allQuestions.filter(q => !selectedQuestions.includes(q));
    while (selectedQuestions.length < 6 && remainingQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
        selectedQuestions.push(remainingQuestions[randomIndex]);
        remainingQuestions.splice(randomIndex, 1);
    }
    
    return selectedQuestions.sort(() => Math.random() - 0.5);
}

// 初始化测试
function initTest() {
    questions = selectRandomQuestions();
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    displayCurrentQuestion();
    document.querySelector('.progress').style.width = '0%';
}

// 显示当前问题
function displayCurrentQuestion() {
    if (!questions || !questions[currentQuestionIndex]) {
        console.error('No questions available at index:', currentQuestionIndex);
        return;
    }

    const question = questions[currentQuestionIndex];
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    
    if (!questionText || !optionsContainer) {
        console.error('Required DOM elements not found');
        return;
    }

    questionText.textContent = question.text;
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option.text;
        optionDiv.onclick = () => selectOption(index);
        optionsContainer.appendChild(optionDiv);
    });
}

// 选择选项
function selectOption(optionIndex) {
    const question = questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = question.options[optionIndex].score;
    
    // 移除之前的选中状态
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // 添加新的选中状态
    options[optionIndex].classList.add('selected');
    
    // 检查是否已经��答过这个问题
    if (userAnswers[currentQuestionIndex] !== null) {
        // 延迟后前进到下一题
        setTimeout(() => {
            nextQuestion();
        }, 400);
    }
}

// 下一个问题
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        // 添加淡出效果
        const questionContainer = document.querySelector('.question-container');
        questionContainer.style.opacity = '0';
        questionContainer.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            currentQuestionIndex++;
            displayCurrentQuestion();
            updateProgressBar();
            
            // 淡入新问题
            setTimeout(() => {
                questionContainer.style.opacity = '1';
                questionContainer.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    } else {
        showResults();
    }
}

// 更新进度条
function updateProgressBar() {
    const progress = (currentQuestionIndex / questions.length) * 100;
    document.querySelector('.progress').style.width = `${progress}%`;
}

// 重新开始测试
function retakeTest() {
    // 隐藏结果页面
    document.getElementById('result-screen').classList.remove('active');
    // 显示测试页面
    document.getElementById('test-screen').classList.add('active');
    // 初始化新测试
    initTest();
}

// 添加页面切换函数
function startNewTest() {
    questions = selectRandomQuestions();
    if (!questions || questions.length === 0) {
        console.error('No questions available');
        alert('无法加载测试题目，请刷新页面重试');
        return;
    }
    
    // 隐藏首页
    document.getElementById('home-screen').classList.remove('active');
    // 显示测试页面
    document.getElementById('test-screen').classList.add('active');
    // 初始化测试
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    displayCurrentQuestion();
    document.querySelector('.progress').style.width = '0%';
}

function returnToHome() {
    // 隐藏结果页面
    document.getElementById('result-screen').classList.remove('active');
    // 显示首页
    document.getElementById('home-screen').classList.add('active');
} 
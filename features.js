// 心情追踪功能
const moods = {
    great: { emoji: '😊', label: '很好' },
    good: { emoji: '🙂', label: '好' },
    neutral: { emoji: '😐', label: '一般' },
    bad: { emoji: '😕', label: '不好' },
    terrible: { emoji: '😢', label: '很差' }
};

function recordMood() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h3>今日心情</h3>
        <div class="mood-selector">
            ${Object.entries(moods).map(([key, mood]) => `
                <div class="mood-option" onclick="saveMood('${key}')">
                    <span class="mood-emoji">${mood.emoji}</span>
                    <span class="mood-label">${mood.label}</span>
                </div>
            `).join('')}
        </div>
    `;
    showModal();
}

function saveMood(mood) {
    const moodHistory = JSON.parse(localStorage.getItem('mood_history') || '{}');
    const today = new Date().toISOString().split('T')[0];
    moodHistory[today] = mood;
    localStorage.setItem('mood_history', JSON.stringify(moodHistory));
    updateMoodCalendar();
    hideModal();
}

// 呼吸练习功能
let breathingInterval;

function startBreathing() {
    document.getElementById('breathing-screen').classList.add('active');
    const circle = document.querySelector('.breathing-circle');
    
    breathingInterval = setInterval(() => {
        circle.classList.add('inhale');
        setTimeout(() => {
            circle.classList.remove('inhale');
            circle.classList.add('exhale');
            setTimeout(() => {
                circle.classList.remove('exhale');
            }, 4000);
        }, 4000);
    }, 8000);
}

function stopBreathing() {
    clearInterval(breathingInterval);
    document.getElementById('breathing-screen').classList.remove('active');
}

// 目标设定功能
function addNewGoal() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h3>添加新目标</h3>
        <form id="goal-form">
            <input type="text" id="goal-title" placeholder="目标标题" required>
            <textarea id="goal-description" placeholder="目标描述"></textarea>
            <input type="date" id="goal-deadline">
            <button type="submit" class="primary-button">保存目标</button>
        </form>
    `;
    
    document.getElementById('goal-form').onsubmit = (e) => {
        e.preventDefault();
        saveGoal();
    };
    
    showModal();
}

function saveGoal() {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const newGoal = {
        id: Date.now(),
        title: document.getElementById('goal-title').value,
        description: document.getElementById('goal-description').value,
        deadline: document.getElementById('goal-deadline').value,
        completed: false
    };
    
    goals.push(newGoal);
    localStorage.setItem('goals', JSON.stringify(goals));
    updateGoalsList();
    hideModal();
}

// 情绪日记功能
function saveDiaryEntry() {
    const diary = JSON.parse(localStorage.getItem('diary_entries') || '[]');
    const newEntry = {
        date: new Date().toISOString(),
        content: document.getElementById('diary-entry').value
    };
    
    diary.push(newEntry);
    localStorage.setItem('diary_entries', JSON.stringify(diary));
    document.getElementById('diary-entry').value = '';
    showToast('日记已保存');
}

// 辅助函数
function showModal() {
    document.getElementById('modal').style.display = 'block';
}

function hideModal() {
    document.getElementById('modal').style.display = 'none';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateMoodCalendar();
    updateGoalsList();
    
    // 关闭模态框
    document.querySelector('.close-button').onclick = hideModal;
    window.onclick = (event) => {
        if (event.target === document.getElementById('modal')) {
            hideModal();
        }
    };
});

// 添加冥想功能
function startMeditation() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h3>冥想引导</h3>
        <div class="meditation-container">
            <div class="meditation-timer">5:00</div>
            <div class="meditation-controls">
                <button onclick="startMeditationTimer()" class="primary-button">开始</button>
                <button onclick="stopMeditation()" class="secondary-button">结束</button>
            </div>
            <div class="meditation-guide">
                请保持放松的坐姿，跟随引导进行冥想...
            </div>
        </div>
    `;
    showModal();
}

let meditationInterval;
function startMeditationTimer() {
    let time = 5 * 60; // 5分钟
    const timerDisplay = document.querySelector('.meditation-timer');
    
    meditationInterval = setInterval(() => {
        time--;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (time <= 0) {
            stopMeditation();
            showToast('冥想结束');
        }
    }, 1000);
}

function stopMeditation() {
    clearInterval(meditationInterval);
    hideModal();
}

// 添加放松音乐功能
const relaxingSounds = {
    rain: { name: '雨声', url: 'sounds/rain.mp3' },
    waves: { name: '海浪', url: 'sounds/waves.mp3' },
    forest: { name: '森林', url: 'sounds/forest.mp3' }
};

let currentAudio;

function playRelaxingMusic() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h3>放松音乐</h3>
        <div class="sound-list">
            ${Object.entries(relaxingSounds).map(([key, sound]) => `
                <button onclick="playSound('${key}')" class="sound-button">
                    <span class="sound-icon">🎵</span>
                    ${sound.name}
                </button>
            `).join('')}
        </div>
        <button onclick="stopSound()" class="secondary-button">停止播放</button>
    `;
    showModal();
}

function playSound(soundKey) {
    if (currentAudio) {
        currentAudio.pause();
    }
    
    // 这里使用一个提示，因为音频文件可能不存在
    showToast('音频功能待实现');
    
    // 实际项目中，取消下面的注释并添加音频文件
    /*
    currentAudio = new Audio(relaxingSounds[soundKey].url);
    currentAudio.loop = true;
    currentAudio.play();
    */
}

function stopSound() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

// 更新目标列表显示
function updateGoalsList() {
    const goalsList = document.getElementById('goals-list');
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    
    goalsList.innerHTML = goals.map(goal => `
        <div class="goal-item ${goal.completed ? 'completed' : ''}">
            <div class="goal-header">
                <h4>${goal.title}</h4>
                <span class="goal-deadline">${goal.deadline}</span>
            </div>
            <p>${goal.description}</p>
            <div class="goal-actions">
                <button onclick="toggleGoalComplete(${goal.id})" class="secondary-button">
                    ${goal.completed ? '取消完成' : '标记完成'}
                </button>
                <button onclick="deleteGoal(${goal.id})" class="secondary-button">删除</button>
            </div>
        </div>
    `).join('');
}

// 切换目标完成状态
function toggleGoalComplete(goalId) {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
        goals[goalIndex].completed = !goals[goalIndex].completed;
        localStorage.setItem('goals', JSON.stringify(goals));
        updateGoalsList();
    }
}

// 删除目标
function deleteGoal(goalId) {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const newGoals = goals.filter(g => g.id !== goalId);
    localStorage.setItem('goals', JSON.stringify(goals));
    updateGoalsList();
}

// 更新心情日历
function updateMoodCalendar() {
    const calendar = document.getElementById('mood-calendar');
    const moodHistory = JSON.parse(localStorage.getItem('mood_history') || '{}');
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    calendar.innerHTML = `
        <div class="calendar-header">
            ${today.getFullYear()}年${today.getMonth() + 1}月
        </div>
        <div class="calendar-grid">
            ${Array.from({length: daysInMonth}, (_, i) => {
                const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                const mood = moodHistory[date];
                return `
                    <div class="calendar-day ${mood ? 'has-mood' : ''}">
                        <span class="day-number">${i + 1}</span>
                        ${mood ? `<span class="mood-emoji">${moods[mood].emoji}</span>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 初始化时添加样式
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
            margin-top: 10px;
        }
        .calendar-day {
            padding: 5px;
            text-align: center;
            border: 1px solid var(--border-color);
            border-radius: 4px;
        }
        .has-mood {
            background-color: var(--primary-light);
        }
        .mood-emoji {
            font-size: 1.2em;
        }
        .goal-item {
            padding: 15px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .goal-item.completed {
            opacity: 0.7;
            background-color: var(--primary-light);
        }
        .sound-button {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
}); 
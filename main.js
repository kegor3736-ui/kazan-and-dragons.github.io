// main.js - Ядро Kazan & Dragons
// Полная поддержка профилей, чатов, онлайн-статуса и партий

// =============== КОНСТАНТЫ ===============
const KD_STORAGE_KEYS = {
    USER: 'kdUser',
    ALL_USERS: 'kdAllUsers',
    CHARACTERS: 'kdCharacters',
    PARTIES: 'kdParties',
    CHATS: 'kdChats',
    TABLETOP: 'kdTabletopState'
};

// =============== ИНИЦИАЛИЗАЦИЯ ===============
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    initStorage();
    initSidebar();
    initAuthSystem();
    initOnlineStatus();
    initCommonEventListeners();
}

// =============== ХРАНЕНИЕ ДАННЫХ ===============
function initStorage() {
    // Пользователи
    if (!localStorage.getItem(KD_STORAGE_KEYS.ALL_USERS)) {
        localStorage.setItem(KD_STORAGE_KEYS.ALL_USERS, JSON.stringify([]));
    }
    
    // Текущий пользователь (если нет — создаём из ALL_USERS при входе)
    if (!localStorage.getItem(KD_STORAGE_KEYS.USER)) {
        // Оставляем пустым — вход через register.html
    }
    
    // Персонажи
    if (!localStorage.getItem(KD_STORAGE_KEYS.CHARACTERS)) {
        localStorage.setItem(KD_STORAGE_KEYS.CHARACTERS, JSON.stringify([]));
    }
    
    // Партии
    if (!localStorage.getItem(KD_STORAGE_KEYS.PARTIES)) {
        const sampleParties = [{
            id: 1,
            title: "Тайна Оберхарфа",
            world: "KAZANA",
            master: "Странник",
            dates: "13 / 20 / 27 февраля",
            description: "Вас нанял очень странный Дворянин низкого роста в Г.Элден, чтобы вы разобрались с проблемой местных жителей отдалённой деревушки Оберхаф. Судя по последним письмам, у них начали частенько пропадать люди. А несколько отрядов авантюристов, посланных туда, не вернулись.\n\nВ окутанной туманом ложбине располагается захолустная деревенька с мрачной репутацией. Вы прибыли сюда с заданием, но с каждым ударом грома и отблеском молнии ваша уверенность в себе улетучивается, а туман сгущается.",
            level: "3–5",
            players: "3–5",
            reward: "800 зм",
            isPaid: true,
            applicants: []
        }];
        localStorage.setItem(KD_STORAGE_KEYS.PARTIES, JSON.stringify(sampleParties));
    }
    
    // Чаты
    if (!localStorage.getItem(KD_STORAGE_KEYS.CHATS)) {
        localStorage.setItem(KD_STORAGE_KEYS.CHATS, JSON.stringify({}));
    }
}

// =============== БОКОВАЯ ПАНЕЛЬ ===============
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');

    if (!sidebar || !menuToggle) return;

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        if (mainContent) {
            mainContent.classList.toggle('sidebar-hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 576 && 
            sidebar && 
            !sidebar.classList.contains('hidden') && 
            !sidebar.contains(e.target) && 
            e.target !== menuToggle) {
            
            sidebar.classList.add('hidden');
            if (mainContent) {
                mainContent.classList.add('sidebar-hidden');
            }
        }
    });
}

// =============== АУТЕНТИФИКАЦИЯ И ПРОФИЛЬ ===============
function initAuthSystem() {
    const authButton = document.getElementById('authButton');
    const accountInfo = document.getElementById('accountInfo');
    const accountName = document.getElementById('accountName');
    const accountRole = document.getElementById('accountRole');
    const heroButtons = document.getElementById('heroButtons');

    if (!authButton) return;

    function updateAuthUI() {
        const user = getCurrentUser();
        
        if (user) {
            if (accountName) accountName.textContent = user.username || '—';
            if (accountRole) accountRole.textContent = user.role === 'dm' ? 'Мастер' : 'Игрок';
            if (accountInfo) accountInfo.classList.add('active');
            
            authButton.textContent = 'Выйти';
            authButton.onclick = logoutUser;
            
            if (heroButtons) heroButtons.style.display = 'none';
        } else {
            if (accountInfo) accountInfo.classList.remove('active');
            
            authButton.textContent = 'Войти / Регистрация';
            authButton.onclick = () => window.location.href = 'register.html';
            
            if (heroButtons) heroButtons.style.display = 'flex';
        }
    }

    updateAuthUI();
    window.updateAuthUI = updateAuthUI;
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(KD_STORAGE_KEYS.USER)) || null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

function getAllUsers() {
    try {
        return JSON.parse(localStorage.getItem(KD_STORAGE_KEYS.ALL_USERS)) || [];
    } catch (error) {
        console.error('Error parsing all users:', error);
        return [];
    }
}

function getUserByUsername(username) {
    return getAllUsers().find(u => u.username === username) || null;
}

function saveUserToDirectory(user) {
    const allUsers = getAllUsers();
    const existingIndex = allUsers.findIndex(u => u.username === user.username);
    if (existingIndex >= 0) {
        allUsers[existingIndex] = { ...allUsers[existingIndex], ...user };
    } else {
        allUsers.push(user);
    }
    localStorage.setItem(KD_STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
}

// =============== ОНЛАЙН-СТАТУС ===============
function initOnlineStatus() {
    updateUserActivity();
    setInterval(updateUserActivity, 60000); // Обновлять каждую минуту
}

function updateUserActivity() {
    const user = getCurrentUser();
    if (user) {
        localStorage.setItem(`kdUserLastActivity_${user.username}`, Date.now().toString());
        saveUserToDirectory(user);
    }
}

function isUserOnline(username) {
    const lastActivity = localStorage.getItem(`kdUserLastActivity_${username}`);
    if (!lastActivity) return false;
    return (Date.now() - parseInt(lastActivity)) < 10 * 60 * 1000; // 10 минут
}

// =============== УПРАВЛЕНИЕ ПАРТИЯМИ ===============
function getParties() {
    try {
        return JSON.parse(localStorage.getItem(KD_STORAGE_KEYS.PARTIES)) || [];
    } catch (error) {
        console.error('Error loading parties:', error);
        return [];
    }
}

function saveParties(parties) {
    localStorage.setItem(KD_STORAGE_KEYS.PARTIES, JSON.stringify(parties));
}

function createParty(partyData) {
    const parties = getParties();
    const newParty = {
        id: Date.now(),
        master: getCurrentUser().username,
        applicants: [],
        ...partyData
    };
    parties.push(newParty);
    saveParties(parties);
    return newParty;
}

function applyToParty(partyId, username) {
    const parties = getParties();
    const party = parties.find(p => p.id === partyId);
    if (party && !party.applicants.includes(username)) {
        party.applicants.push(username);
        saveParties(parties);
        return true;
    }
    return false;
}

// =============== ЧАТЫ ===============
function getChatMessages(partyId) {
    try {
        const chats = JSON.parse(localStorage.getItem(KD_STORAGE_KEYS.CHATS)) || {};
        return chats[partyId] || [];
    } catch (error) {
        console.error('Error loading chat:', error);
        return [];
    }
}

function saveChatMessage(partyId, text) {
    const chats = JSON.parse(localStorage.getItem(KD_STORAGE_KEYS.CHATS)) || {};
    if (!chats[partyId]) chats[partyId] = [];
    chats[partyId].push({
        user: getCurrentUser()?.username || 'Гость',
        text: escapeHtml(text),
        timestamp: Date.now()
    });
    localStorage.setItem(KD_STORAGE_KEYS.CHATS, JSON.stringify(chats));
}

// =============== ОБЩИЕ СЛУШАТЕЛИ ===============
function initCommonEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href]')) {
            const href = e.target.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                console.log('Navigation to:', href);
            }
        }
    });

    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.method === 'get') return;
        console.log('Form submitted:', form.id || form.className);
    });
}

// =============== СИСТЕМА ВЫХОДА ===============
function logoutUser() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem(KD_STORAGE_KEYS.USER);
        
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        }
        
        if (window.location.pathname.includes('characters.html') || 
            window.location.pathname.includes('parties.html')) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    }
}

// =============== ПРОВЕРКИ ДОСТУПА ===============
function isUserLoggedIn() {
    return !!getCurrentUser();
}

function isUserDM() {
    const user = getCurrentUser();
    return user && user.role === 'dm';
}

function requireAuth() {
    if (!isUserLoggedIn()) {
        if (confirm('Для доступа к этой странице требуется регистрация. Перейти к регистрации?')) {
            window.location.href = 'register.html';
        }
        return false;
    }
    return true;
}

// =============== УВЕДОМЛЕНИЯ ===============
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">${escapeHtml(message)}</div>
        <button class="notification-close">&times;</button>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#f87171' : type === 'success' ? '#4ade80' : '#6a0dad',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: '10000',
        maxWidth: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
    });
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = 'background:none;border:none;color:white;cursor:pointer;font-size:1.2rem;';
    closeBtn.addEventListener('click', () => notification.remove());
    
    document.body.appendChild(notification);
    
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, duration);
    }
}

// =============== УТИЛИТЫ ===============
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    return password && password.length >= 8;
}

// =============== ЭКСПОРТ/ИМПОРТ ===============
function exportToJson(data, filename = 'data.json') {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Ошибка при экспорте данных', 'error');
        return false;
    }
}

function importFromJson(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    };
    reader.onerror = (error) => callback(error, null);
    reader.readAsText(file);
}

// =============== ГЛОБАЛЬНЫЙ ДОСТУП ===============
window.KD = {
    // Аутентификация
    getCurrentUser,
    getAllUsers,
    getUserByUsername,
    isUserOnline,
    isUserLoggedIn,
    isUserDM,
    requireAuth,
    logoutUser,
    
    // Хранение
    getParties,
    saveParties,
    createParty,
    applyToParty,
    getChatMessages,
    saveChatMessage,
    
    // Утилиты
    showNotification,
    escapeHtml,
    exportToJson,
    importFromJson,
    generateId
};

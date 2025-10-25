// main.js - Общие функции для всех страниц Kazan & Dragons

// =============== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И КОНСТАНТЫ ===============
const KD_STORAGE_KEYS = {
    USER: 'kdUser',
    CHARACTERS: 'kdCharacters',
    PARTIES: 'kdParties',
    TABLETOP: 'kdTabletopState'
};

// =============== ОСНОВНЫЕ ФУНКЦИИ УПРАВЛЕНИЯ ===============

// Инициализация приложения
function initApp() {
    initSidebar();
    initAuth();
    initCommonEventListeners();
}

// Инициализация боковой панели
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

    // Закрытие боковой панели на мобильных устройствах
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

// Инициализация системы аутентификации
function initAuth() {
    const authButton = document.getElementById('authButton');
    const accountInfo = document.getElementById('accountInfo');
    const accountName = document.getElementById('accountName');
    const accountRole = document.getElementById('accountRole');
    const heroButtons = document.getElementById('heroButtons');

    if (!authButton) return;

    function updateAuthUI() {
        const user = getCurrentUser();
        
        if (user) {
            // Пользователь авторизован
            if (accountName) accountName.textContent = user.username;
            if (accountRole) accountRole.textContent = user.role === 'player' ? 'Игрок' : 'Мастер';
            if (accountInfo) accountInfo.classList.add('active');
            
            authButton.textContent = 'Выйти';
            authButton.onclick = logoutUser;
            
            // Скрыть CTA кнопки на главной
            if (heroButtons) heroButtons.style.display = 'none';
        } else {
            // Пользователь не авторизован
            if (accountInfo) accountInfo.classList.remove('active');
            
            authButton.textContent = 'Войти / Регистрация';
            authButton.onclick = () => window.location.href = 'register.html';
            
            // Показать CTA кнопки на главной
            if (heroButtons) heroButtons.style.display = 'flex';
        }
    }

    updateAuthUI();
}

// Инициализация общих обработчиков событий
function initCommonEventListeners() {
    // Обработка навигации
    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href]')) {
            const href = e.target.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                // Можно добавить логику отслеживания переходов
                console.log('Navigation to:', href);
            }
        }
    });

    // Обработка форм
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.method === 'get') return;
        
        // Можно добавить общую валидацию форм
        console.log('Form submitted:', form.id || form.className);
    });
}

// =============== СИСТЕМА АУТЕНТИФИКАЦИИ ===============

// Получить текущего пользователя
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(KD_STORAGE_KEYS.USER));
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

// Проверить авторизацию
function isUserLoggedIn() {
    return !!getCurrentUser();
}

// Выйти из системы
function logoutUser() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem(KD_STORAGE_KEYS.USER);
        
        // Обновляем UI
        initAuth();
        
        // Если на странице требуется авторизация - перенаправляем
        if (window.location.pathname.includes('characters.html') || 
            window.location.pathname.includes('parties.html')) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    }
}

// Проверить права доступа (только для мастеров)
function isUserDM() {
    const user = getCurrentUser();
    return user && user.role === 'dm';
}

// Требовать авторизацию
function requireAuth() {
    if (!isUserLoggedIn()) {
        if (confirm('Для доступа к этой странице требуется регистрация. Перейти к регистрации?')) {
            window.location.href = 'register.html';
        }
        return false;
    }
    return true;
}

// =============== СИСТЕМА ХРАНЕНИЯ ДАННЫХ ===============

// Инициализация данных
function initStorage() {
    // Персонажи
    if (!localStorage.getItem(KD_STORAGE_KEYS.CHARACTERS)) {
        localStorage.setItem(KD_STORAGE_KEYS.CHARACTERS, JSON.stringify([]));
    }
    
    // Партии
    if (!localStorage.getItem(KD_STORAGE_KEYS.PARTIES)) {
        const sampleParties = [
            {
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
            }
        ];
        localStorage.setItem(KD_STORAGE_KEYS.PARTIES, JSON.stringify(sampleParties));
    }
}

// Получить данные
function getStorageData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        return [];
    }
}

// Сохранить данные
function setStorageData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        return false;
    }
}

// =============== СИСТЕМА УВЕДОМЛЕНИЙ ===============

// Показать уведомление
function showNotification(message, type = 'info', duration = 5000) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    // Стили для уведомления
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
    
    // Кнопка закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '1.2rem';
    
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Добавляем в DOM
    document.body.appendChild(notification);
    
    // Автоматическое закрытие
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
    
    return notification;
}

// =============== СИСТЕМА ЗАГРУЗКИ ===============

// Показать индикатор загрузки
function showLoading(container) {
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    loader.innerHTML = `
        <div class="spinner"></div>
        <div>Загрузка...</div>
    `;
    
    Object.assign(loader.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'var(--accent)'
    });
    
    const spinner = loader.querySelector('.spinner');
    Object.assign(spinner.style, {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(138, 43, 226, 0.3)',
        borderTop: '4px solid var(--primary-light)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
    });
    
    // Добавляем анимацию в CSS если её нет
    if (!document.querySelector('#spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    if (container) {
        container.innerHTML = '';
        container.appendChild(loader);
    }
    
    return loader;
}

// =============== СИСТЕМА ОШИБОК ===============

// Обработка ошибок
function handleError(error, userMessage = 'Произошла ошибка') {
    console.error('Application error:', error);
    
    // Показываем пользователю понятное сообщение
    showNotification(userMessage, 'error');
    
    // Можно добавить отправку ошибок на сервер
    // logErrorToServer(error);
}

// =============== УТИЛИТЫ ===============

// Генерация ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Форматирование даты
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

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Валидация пароля
function isValidPassword(password) {
    return password && password.length >= 8;
}

// Экранирование HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =============== СИСТЕМА ЭКСПОРТА/ИМПОРТА ===============

// Экспорт данных в JSON файл
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
        handleError(error, 'Ошибка при экспорте данных');
        return false;
    }
}

// Импорт данных из JSON файла
function importFromJson(file, callback) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    };
    
    reader.onerror = function(error) {
        callback(error, null);
    };
    
    reader.readAsText(file);
}

// =============== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===============

// Запуск приложения когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Экспорт функций для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApp,
        getCurrentUser,
        isUserLoggedIn,
        requireAuth,
        showNotification,
        handleError,
        exportToJson,
        importFromJson
    };
}
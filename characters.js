// characters.js - Логика для страницы персонажей

// Таблица опыта для уровней
const expTable = {
    1: 0,
    2: 300,
    3: 900,
    4: 2700,
    5: 6500,
    6: 14000,
    7: 23000,
    8: 34000,
    9: 48000,
    10: 64000,
    11: 85000,
    12: 100000,
    13: 120000,
    14: 140000,
    15: 165000,
    16: 195000,
    17: 225000,
    18: 265000,
    19: 305000,
    20: 355000
};

// Навыки по характеристикам
const skillsByAbility = {
    str: ['athletics'],
    dex: ['acrobatics', 'sleight', 'stealth'],
    int: ['investigation', 'history', 'arcana', 'nature', 'religion'],
    wis: ['perception', 'survival', 'medicine', 'insight', 'animal'],
    cha: ['performance', 'intimidation', 'deception', 'persuasion']
};

// Основная функция инициализации
function initCharactersPage() {
    console.log('Initializing characters page...');
    
    // Инициализация базовых элементов
    initSidebar();
    initAuthSystem();
    initCharacterGrid();
    initEventListeners();
    
    console.log('Characters page initialized successfully');
}

// Инициализация боковой панели
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');

    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('sidebar-hidden');
        });

        // Закрытие боковой панели на мобильных
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 576 && 
                !sidebar.classList.contains('hidden') && 
                !sidebar.contains(e.target) && 
                e.target !== menuToggle) {
                sidebar.classList.add('hidden');
                mainContent.classList.add('sidebar-hidden');
            }
        });
    }
}

// Система аутентификации
function initAuthSystem() {
    const authButton = document.getElementById('authButton');
    const accountInfo = document.getElementById('accountInfo');
    const accountName = document.getElementById('accountName');
    const accountRole = document.getElementById('accountRole');

    function updateAuthUI() {
        const user = JSON.parse(localStorage.getItem('kdUser'));
        if (user && accountName && accountRole && authButton && accountInfo) {
            accountName.textContent = user.username;
            accountRole.textContent = user.role === 'player' ? 'Игрок' : 'Мастер';
            accountInfo.classList.add('active');
            authButton.textContent = 'Выйти';
            authButton.onclick = () => {
                localStorage.removeItem('kdUser');
                window.location.reload();
            };
        } else if (authButton) {
            accountInfo.classList.remove('active');
            authButton.textContent = 'Войти / Регистрация';
            authButton.onclick = () => window.location.href = 'register.html';
        }
    }

    updateAuthUI();
    return updateAuthUI;
}

// Проверка авторизации
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('kdUser'));
    if (!user) {
        alert('Для доступа к персонажам необходимо войти в систему.');
        window.location.href = 'register.html';
        return false;
    }
    return true;
}

// Инициализация сетки персонажей
function initCharacterGrid() {
    renderCharactersGrid();
}

// Отображение сетки персонажей — ОБНОВЛЕНО ПОД ВАШИ ТРЕБОВАНИЯ
function renderCharactersGrid() {
    const charactersGrid = document.getElementById('charactersGrid');
    if (!charactersGrid) return;

    const characters = JSON.parse(localStorage.getItem('kdCharacters')) || [];
    const user = JSON.parse(localStorage.getItem('kdUser'));
    const userCharacters = characters.filter(char => char.owner === user.username);

    if (userCharacters.length === 0) {
        charactersGrid.innerHTML = `
            <div class="empty-state">
                <p>У вас пока нет персонажей.</p>
                <p style="margin-top: 1rem; font-size: 0.95rem; opacity: 0.8;">
                    Нажмите «+ Новый персонаж», чтобы создать первого героя!
                </p>
            </div>
        `;
        return;
    }

    charactersGrid.innerHTML = userCharacters.map(char => {
        // Опыт до следующего уровня
        const currentExp = char.exp || 0;
        const currentLevel = char.level || 1;
        const nextLevelExp = currentLevel < 20 ? expTable[currentLevel + 1] : expTable[20];
        const expProgress = currentLevel < 20 
            ? Math.min(100, Math.max(0, ((currentExp - expTable[currentLevel]) / (nextLevelExp - expTable[currentLevel])) * 100))
            : 100;

        // Хиты
        const currentHP = char.currentHP || 0;
        const maxHP = char.maxHP || 1;
        const hpPercent = Math.min(100, Math.max(0, (currentHP / maxHP) * 100));

        // Временные хиты
        const tempHP = char.tempHP || 0;

        return `
            <div class="char-card-discord">
                <div class="char-avatar-container">
                    ${char.portrait 
                        ? `<img src="${char.portrait}" alt="Портрет">` 
                        : `<div class="char-avatar-fallback">${char.name?.charAt(0) || '?'}</div>`
                    }
                </div>
                <div class="char-info">
                    <div class="char-name">${char.name || 'Безымянный'}</div>
                    
                    <!-- Полоска опыта -->
                    <div class="char-level-exp">
                        <div class="level-text">Уровень ${currentLevel}</div>
                        <div class="exp-bar">
                            <div class="exp-fill" style="width: ${expProgress}%"></div>
                        </div>
                        <div class="exp-text">${currentExp} / ${nextLevelExp} XP</div>
                    </div>
                    
                    <div class="char-class-race">
                        ${char.class || '—'} / ${char.race || '—'}
                    </div>
                    
                    <!-- Полоска хитов -->
                    <div class="char-hp-section">
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: ${hpPercent}%"></div>
                        </div>
                        <div class="hp-text">${currentHP} / ${maxHP} HP</div>
                    </div>
                    
                    ${tempHP > 0 ? `
                        <div class="char-temp-hp">
                            Временные HP: <strong>${tempHP}</strong>
                        </div>
                    ` : ''}
                    
                    <div class="char-actions">
                        <button class="char-btn edit-btn" data-id="${char.id}">Редактировать</button>
                        <button class="char-btn delete-btn" data-id="${char.id}">Удалить</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Обработчики кнопок
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const charId = this.getAttribute('data-id');
            editCharacter(charId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const charId = this.getAttribute('data-id');
            if (confirm('Удалить этого персонажа?')) {
                deleteCharacter(charId);
            }
        });
    });
}

// Удаление персонажа
function deleteCharacter(charId) {
    let characters = JSON.parse(localStorage.getItem('kdCharacters')) || [];
    characters = characters.filter(char => char.id != charId);
    localStorage.setItem('kdCharacters', JSON.stringify(characters));
    renderCharactersGrid();
}

// Редактирование персонажа (заглушка)
function editCharacter(charId) {
    alert('Редактирование персонажа будет реализовано в будущем');
}

// Инициализация обработчиков событий
function initEventListeners() {
    const newCharBtn = document.getElementById('newCharBtn');
    if (newCharBtn) {
        newCharBtn.addEventListener('click', openCharacterEditor);
    }
}

// Открытие редактора персонажа
function openCharacterEditor() {
    if (!checkAuth()) return;

    const characterEditor = document.getElementById('characterEditor');
    if (characterEditor) {
        characterEditor.style.display = 'block';
        initCharacterSheet();
    }
}

// Инициализация листа персонажа
function initCharacterSheet() {
    initAbilityScores();
    initSkills();
    initDeathSaves();
    initWeapons();
    initPortrait();
    initCalculations();
    initSheetEventListeners();
    initSpellbook();
    initCoinCalculator();
    
    // Инициализация кнопок редактора
    initEditorButtons();
}

// Инициализация кнопок редактора
function initEditorButtons() {
    const saveCharBtn = document.getElementById('saveCharBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const closeEditor = document.getElementById('closeEditor');

    if (saveCharBtn) {
        saveCharBtn.addEventListener('click', saveCharacter);
    }

    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', exportToJson);
    }

    if (closeEditor) {
        closeEditor.addEventListener('click', () => {
            document.getElementById('characterEditor').style.display = 'none';
            renderCharactersGrid();
        });
    }
}

// Инициализация характеристик
function initAbilityScores() {
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    abilities.forEach(ability => {
        const scoreInput = document.getElementById(`${ability}Score`);
        if (scoreInput) {
            scoreInput.addEventListener('input', () => updateAbilityModifier(ability));
        }
    });
}

// Обновление модификаторов характеристик
function updateAbilityModifier(abilityId) {
    const score = parseInt(document.getElementById(`${abilityId}Score`).value) || 10;
    const modifier = Math.floor((score - 10) / 2);
    const modElement = document.getElementById(`${abilityId}Mod`);
    
    if (modElement) {
        modElement.textContent = modifier >= 0 ? `+${modifier}` : modifier.toString();
    }
    
    updateSkills(abilityId);
    updateCalculations();
}

// Инициализация навыков
function initSkills() {
    Object.entries(skillsByAbility).forEach(([ability, skillList]) => {
        skillList.forEach(skill => {
            const checkbox = document.getElementById(skill);
            if (checkbox) {
                checkbox.addEventListener('change', () => updateSkillModifier(skill, ability));
            }
        });
    });
}

function updateSkills(abilityId) {
    if (skillsByAbility[abilityId]) {
        skillsByAbility[abilityId].forEach(skill => {
            updateSkillModifier(skill, abilityId);
        });
    }
}

function updateSkillModifier(skill, ability) {
    const abilityScore = parseInt(document.getElementById(`${ability}Score`).value) || 10;
    const abilityMod = Math.floor((abilityScore - 10) / 2);
    const isProficient = document.getElementById(skill).checked;
    const proficiencyBonus = parseInt(document.getElementById('proficiencyBonus').textContent.replace('+', '')) || 2;
    const totalMod = abilityMod + (isProficient ? proficiencyBonus : 0);
    
    const modElement = document.getElementById(`${skill}Mod`);
    if (modElement) {
        modElement.textContent = totalMod >= 0 ? `+${totalMod}` : totalMod.toString();
    }
}

// Инициализация спасбросков от смерти
function initDeathSaves() {
    const rollButton = document.getElementById('rollDeathSave');
    if (rollButton) {
        rollButton.addEventListener('click', rollDeathSave);
    }

    // Обработчики для кружков
    document.querySelectorAll('.death-save-circle').forEach(circle => {
        circle.addEventListener('click', function() {
            this.classList.toggle('filled');
        });
    });
}

// Бросок спасброска от смерти
function rollDeathSave() {
    const roll = Math.floor(Math.random() * 20) + 1;
    alert(`Бросок спасброска от смерти: ${roll}`);
    
    if (roll === 1) {
        // Критический провал - два провала
        addDeathFailure();
        addDeathFailure();
    } else if (roll < 10) {
        addDeathFailure();
    } else if (roll === 20) {
        // Критический успех - восстанавливаем 1 хп и сбрасываем спасброски
        alert('Критический успех! Персонаж восстанавливает 1 хп!');
        resetDeathSaves();
        const currentHP = parseInt(document.getElementById('currentHP').value) || 0;
        document.getElementById('currentHP').value = currentHP + 1;
    } else {
        addDeathSuccess();
    }
    
    checkDeathSaves();
}

function addDeathSuccess() {
    const circles = document.querySelectorAll('#successCircles .death-save-circle');
    for (let circle of circles) {
        if (!circle.classList.contains('filled')) {
            circle.classList.add('filled');
            break;
        }
    }
}

function addDeathFailure() {
    const circles = document.querySelectorAll('#failureCircles .death-save-circle');
    for (let circle of circles) {
        if (!circle.classList.contains('filled')) {
            circle.classList.add('filled');
            break;
        }
    }
}

function resetDeathSaves() {
    document.querySelectorAll('.death-save-circle').forEach(circle => {
        circle.classList.remove('filled');
    });
}

function checkDeathSaves() {
    const successCount = document.querySelectorAll('#successCircles .death-save-circle.filled').length;
    const failureCount = document.querySelectorAll('#failureCircles .death-save-circle.filled').length;
    
    if (successCount >= 3) {
        alert('Три успешных спасброска! Персонаж стабилизирован.');
        resetDeathSaves();
    } else if (failureCount >= 3) {
        alert('Три провальных спасброска! Персонаж умирает.');
        resetDeathSaves();
    }
}

// Инициализация оружия
function initWeapons() {
    const addButton = document.getElementById('addWeapon');
    if (addButton) {
        addButton.addEventListener('click', addWeaponRow);
    }
}

function addWeaponRow() {
    const tbody = document.getElementById('weaponsTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="form-control" placeholder="Название оружия"></td>
        <td><input type="text" class="form-control" placeholder="Бонус атаки"></td>
        <td><input type="text" class="form-control" placeholder="Урон и тип"></td>
        <td><input type="text" class="form-control" placeholder="Заметки"></td>
    `;
    tbody.appendChild(newRow);
}

// Инициализация портрета
function initPortrait() {
    const placeholder = document.getElementById('portraitPlaceholder');
    const upload = document.getElementById('portraitUpload');
    
    if (placeholder && upload) {
        placeholder.addEventListener('click', () => upload.click());
        upload.addEventListener('change', handlePortraitUpload);
    }
}

function handlePortraitUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('portraitPreview');
            const placeholder = document.getElementById('portraitPlaceholder');
            
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Инициализация расчетов
function initCalculations() {
    // Обновляем инициативу (модификатор ловкости)
    const dexScore = parseInt(document.getElementById('dexScore').value) || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);
    document.getElementById('initiativeValue').textContent = dexMod >= 0 ? `+${dexMod}` : dexMod.toString();
    
    // Обновляем пассивное восприятие
    updatePassivePerception();
    
    // Обновляем класс защиты с учетом щита
    updateArmorClass();
    
    // Обновляем бонус владения на основе уровня
    updateProficiencyBonus();
}

function updatePassivePerception() {
    const wisScore = parseInt(document.getElementById('wisScore').value) || 10;
    const wisMod = Math.floor((wisScore - 10) / 2);
    const perceptionProficient = document.getElementById('perception').checked;
    const proficiencyBonus = parseInt(document.getElementById('proficiencyBonus').textContent.replace('+', '')) || 2;
    const passivePerception = 10 + wisMod + (perceptionProficient ? proficiencyBonus : 0);
    document.getElementById('passivePerceptionValue').textContent = passivePerception;
}

function updateArmorClass() {
    const baseAC = parseInt(document.getElementById('armorClass').value) || 10;
    const shieldActive = document.getElementById('shieldToggle').checked;
    const shieldBonus = shieldActive ? parseInt(document.getElementById('shieldBonus').value) || 0 : 0;
    document.getElementById('armorClass').value = baseAC + shieldBonus;
}

function updateProficiencyBonus() {
    const level = parseInt(document.getElementById('charLevel').value) || 1;
    let bonus = 2;
    if (level >= 5) bonus = 3;
    if (level >= 9) bonus = 4;
    if (level >= 13) bonus = 5;
    if (level >= 17) bonus = 6;
    document.getElementById('proficiencyBonus').textContent = `+${bonus}`;
}

// Автоматическое обновление уровня на основе опыта
function updateLevelFromExp() {
    const exp = parseInt(document.getElementById('charExp').value) || 0;
    let level = 1;
    
    for (let i = 20; i >= 1; i--) {
        if (exp >= expTable[i]) {
            level = i;
            break;
        }
    }
    
    document.getElementById('charLevel').value = level;
    updateProficiencyBonus();
}

// Инициализация калькулятора монет
function initCoinCalculator() {
    const calculateButton = document.getElementById('calculateCoins');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateTotalCoins);
    }
}

function calculateTotalCoins() {
    const cp = parseInt(document.getElementById('cp').value) || 0;
    const sp = parseInt(document.getElementById('sp').value) || 0;
    const gp = parseInt(document.getElementById('gp').value) || 0;
    const ep = parseInt(document.getElementById('ep').value) || 0;
    const pp = parseInt(document.getElementById('pp').value) || 0;
    
    // Конвертация в медные монеты
    const totalCP = cp + (sp * 10) + (gp * 100) + (ep * 50) + (pp * 1000);
    
    // Конвертация обратно в разные типы монет для отображения
    const remainingPP = Math.floor(totalCP / 1000);
    const remainingAfterPP = totalCP % 1000;
    const remainingGP = Math.floor(remainingAfterPP / 100);
    const remainingAfterGP = remainingAfterPP % 100;
    const remainingEP = Math.floor(remainingAfterGP / 50);
    const remainingAfterEP = remainingAfterGP % 50;
    const remainingSP = Math.floor(remainingAfterEP / 10);
    const remainingCP = remainingAfterEP % 10;
    
    document.getElementById('coinTotal').textContent = 
        `Всего: ${remainingPP} ПМ, ${remainingGP} ЗМ, ${remainingEP} ЭМ, ${remainingSP} СМ, ${remainingCP} ММ`;
}

// Инициализация книги заклинаний
function initSpellbook() {
    const spellLevels = document.querySelectorAll('.spell-level');
    spellLevels.forEach(level => {
        level.addEventListener('click', function() {
            spellLevels.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Инициализация обработчиков событий листа
function initSheetEventListeners() {
    // Обработчики для обновления расчетов
    document.getElementById('dexScore').addEventListener('input', () => {
        const dexScore = parseInt(document.getElementById('dexScore').value) || 10;
        const dexMod = Math.floor((dexScore - 10) / 2);
        document.getElementById('initiativeValue').textContent = dexMod >= 0 ? `+${dexMod}` : dexMod.toString();
    });

    document.getElementById('wisScore').addEventListener('input', updatePassivePerception);
    document.getElementById('perception').addEventListener('change', updatePassivePerception);
    
    document.getElementById('shieldToggle').addEventListener('change', updateArmorClass);
    document.getElementById('shieldBonus').addEventListener('input', updateArmorClass);

    // Обработчик для опыта
    document.getElementById('charExp').addEventListener('input', updateLevelFromExp);

    // Валидация хитов
    document.getElementById('currentHP').addEventListener('change', function() {
        let current = parseInt(this.value) || 0;
        const max = parseInt(document.getElementById('maxHP').value) || 0;
        if (current < 0) this.value = 0;
        if (current > max) this.value = max;
    });
}

// Сохранение персонажа — ОБНОВЛЕНО: сохраняем изображение
function saveCharacter() {
    const characterData = getCharacterData();
    
    // Получаем текущий список персонажей
    let characters = JSON.parse(localStorage.getItem('kdCharacters')) || [];
    const user = JSON.parse(localStorage.getItem('kdUser'));
    
    // Добавляем владельца
    characterData.owner = user.username;
    characterData.id = Date.now();
    characterData.createdAt = new Date().toISOString();
    
    characters.push(characterData);
    localStorage.setItem('kdCharacters', JSON.stringify(characters));
    
    alert(`Персонаж "${characterData.name}" успешно сохранен!`);
    document.getElementById('characterEditor').style.display = 'none';
    renderCharactersGrid();
}

// Экспорт в JSON
function exportToJson() {
    const characterData = getCharacterData();
    const jsonString = JSON.stringify(characterData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterData.name || 'character'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Получение данных персонажа — ОБНОВЛЕНО: сохраняем изображение
function getCharacterData() {
    // Получаем data URL изображения
    const portraitPreview = document.getElementById('portraitPreview');
    const portrait = portraitPreview.src && !portraitPreview.src.includes('placehold') 
        ? portraitPreview.src 
        : null;

    return {
        name: document.getElementById('charName').value,
        background: document.getElementById('charBackground').value,
        class: document.getElementById('charClass').value,
        race: document.getElementById('charRace').value,
        subclass: document.getElementById('charSubclass').value,
        level: parseInt(document.getElementById('charLevel').value) || 1,
        exp: parseInt(document.getElementById('charExp').value) || 0,
        armorClass: parseInt(document.getElementById('armorClass').value) || 10,
        currentHP: parseInt(document.getElementById('currentHP').value) || 0,
        tempHP: parseInt(document.getElementById('tempHP').value) || 0,
        maxHP: parseInt(document.getElementById('maxHP').value) || 0,
        hitDice: document.getElementById('hitDiceCount').value + document.getElementById('hitDiceType').value,
        speed: parseInt(document.getElementById('speedValue').value) || 30,
        portrait: portrait, // ← сохраняем изображение
        // Остальные поля можно добавить по мере необходимости
    };
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initCharactersPage);

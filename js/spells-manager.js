console.log("spells-manager.js загружен");

const spellsManager = {
  init: function() {
    console.log("spellsManager.init() вызван");
    this.loadSpells();
    this.setupEventListeners();
  },

  loadSpells: function() {
    console.log("loadSpells() вызван");
    const spells = spellsManager.getAllSpells();
    console.log("Получено заклинаний:", spells.length);
    this.displaySpells(spells);
    this.hideLoading();
  },

  displaySpells: function(spells) {
    console.log("displaySpells() вызван с", spells.length, "заклинаниями");
    const grid = document.getElementById('spellsGrid');
    const noResults = document.getElementById('noResults');

    if (!grid) {
      console.error("Элемент spellsGrid не найден!");
      return;
    }

    grid.innerHTML = '';

    if (spells.length === 0) {
      noResults.style.display = 'block';
      console.log("Нет результатов для отображения");
      return;
    }

    noResults.style.display = 'none';

    spells.forEach((spell, index) => {
      console.log("Создаю карточку для заклинания", index + 1, spell.name);
      const spellCard = this.createSpellCard(spell);
      grid.appendChild(spellCard);
    });
  },

  createSpellCard: function(spell) {
    const card = document.createElement('a');
    card.className = 'spell-card';
    card.href = `spellsdnd/spell-${this.getSpellSlug(spell.name_en)}.html`;
    card.innerHTML = `
      <div class="spell-header">
        <h3>${spell.name}</h3>
        <span class="spell-level">${spell.level === 0 ? 'Заговор' : spell.level + ' уровень'}</span>
      </div>
      <div class="spell-school">${spell.school_ru}</div>
      <div class="spell-classes">
        ${spell.classes.map(cls => `<span class="class-tag">${this.getClassLabel(cls)}</span>`).join('')}
      </div>
      <div class="spell-description">
        ${spell.description}
      </div>
      <div class="spell-meta">
        <div class="meta-item">
          <i class='bx bx-time'></i>
          <span>${spell.casting_time}</span>
        </div>
        <div class="meta-item">
          <i class='bx bx-ruler'></i>
          <span>${spell.range}</span>
        </div>
      </div>
      <div class="card-arrow">
        <i class='bx bx-chevron-right'></i>
      </div>
    `;

    return card;
  },

  getSpellSlug: function(nameEn) {
    return nameEn.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  getClassLabel: function(className) {
    const classLabels = {
      'bard': 'Бард',
      'cleric': 'Жрец',
      'druid': 'Друид',
      'paladin': 'Паладин',
      'ranger': 'Следопыт',
      'sorcerer': 'Чародей',
      'warlock': 'Колдун',
      'wizard': 'Волшебник'
    };
    return classLabels[className] || className;
  },

  setupEventListeners: function() {
    console.log("setupEventListeners() вызван");
    
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');
    const searchInput = document.getElementById('searchSpell');

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        console.log("Кнопка Применить нажата");
        this.applyFilters();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        console.log("Кнопка Сбросить нажата");
        this.resetFilters();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        console.log("Поиск изменен:", searchInput.value);
        this.applyFilters();
      });
    }

    document.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', () => {
        console.log("Фильтр изменен:", select.id, select.value);
        this.applyFilters();
      });
    });
  },

  applyFilters: function() {
    console.log("applyFilters() вызван");
    const filters = {
      level: document.getElementById('levelFilter').value,
      school: document.getElementById('schoolFilter').value,
      class: document.getElementById('classFilter').value,
      search: document.getElementById('searchSpell').value
    };

    console.log("Текущие фильтры:", filters);
    const filteredSpells = spellsManager.filterSpells(filters);
    this.displaySpells(filteredSpells);
  },

  resetFilters: function() {
    console.log("resetFilters() вызван");
    document.getElementById('levelFilter').value = 'all';
    document.getElementById('schoolFilter').value = 'all';
    document.getElementById('classFilter').value = 'all';
    document.getElementById('searchSpell').value = '';
    
    this.applyFilters();
  },

  hideLoading: function() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
      console.log("Спиннер скрыт");
    }
  }
};
// Простые данные для теста
const spellsData = [
  {
    id: 1,
    name: "Волшебная стрела",
    name_en: "Magic Missile",
    level: 1,
    school: "evocation",
    school_ru: "Воплощение",
    casting_time: "1 действие",
    range: "120 футов",
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаете три сверкающие стрелы магии. Каждая стрела попадает в существо по вашему выбору, видимое в пределах дистанции.",
    classes: ["wizard", "sorcerer"]
  },
  {
    id: 2,
    name: "Огненный шар",
    name_en: "Fireball",
    level: 3,
    school: "evocation",
    school_ru: "Воплощение",
    casting_time: "1 действие",
    range: "150 футов",
    components: "В, С, М",
    duration: "Мгновенная",
    description: "Яркая вспышка вырывается из вашей руки и превращается в шар огня с громким ревом.",
    classes: ["wizard", "sorcerer"]
  },
  {
    id: 3,
    name: "Лечение ран",
    name_en: "Cure Wounds",
    level: 1,
    school: "evocation",
    school_ru: "Воплощение",
    casting_time: "1 действие",
    range: "Касание",
    components: "В, С",
    duration: "Мгновенная",
    description: "Существо, которого вы касаетесь, восстанавливает количество хитов.",
    classes: ["bard", "cleric", "druid", "paladin", "ranger"]
  }
];

// Простые функции
const spellsManager = {
  getAllSpells: function() {
    console.log("getAllSpells вызван, возвращаю", spellsData.length, "заклинаний");
    return spellsData;
  },

  filterSpells: function(filters) {
    console.log("filterSpells вызван с фильтрами:", filters);
    let filtered = spellsData;

    if (filters.level !== 'all') {
      filtered = filtered.filter(spell => spell.level === parseInt(filters.level));
    }

    if (filters.school !== 'all') {
      filtered = filtered.filter(spell => spell.school === filters.school);
    }

    if (filters.class !== 'all') {
      filtered = filtered.filter(spell => spell.classes.includes(filters.class));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm) || 
        spell.name_en.toLowerCase().includes(searchTerm)
      );
    }

    console.log("После фильтрации осталось:", filtered.length, "заклинаний");
    return filtered;
  },

  getSpellById: function(id) {
    return spellsData.find(spell => spell.id === id);
  }
};

console.log("spells-data.js загружен");
// Kazan & Dragons — main.js
// Полный клиентский код для управления персонажами, авторизацией и интерфейсом

document.addEventListener('DOMContentLoaded', () => {
  // === ОБЩИЕ ЭЛЕМЕНТЫ (могут отсутствовать на некоторых страницах) ===
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const menuToggle = document.getElementById('menuToggle');
  const authButton = document.getElementById('authButton');
  const accountInfo = document.getElementById('accountInfo');
  const accountName = document.getElementById('accountName');
  const accountRole = document.getElementById('accountRole');

  // === 1. БОКОВАЯ ПАНЕЛЬ (SIDEBAR) ===
  if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
      mainContent.classList.toggle('sidebar-hidden');
    });

    // Закрытие на мобильных при клике вне сайдбара
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 576 && !sidebar.classList.contains('hidden') &&
          !sidebar.contains(e.target) && e.target !== menuToggle) {
        sidebar.classList.add('hidden');
        mainContent.classList.add('sidebar-hidden');
      }
    });
  }

  // === 2. АВТОРИЗАЦИЯ ===
  function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('kdUser'));
    if (user) {
      if (accountName) accountName.textContent = user.username;
      if (accountRole) accountRole.textContent = user.role === 'dm' ? 'Мастер' : 'Игрок';
      if (accountInfo) accountInfo.classList.add('active');
      if (authButton) {
        authButton.textContent = 'Выйти';
        authButton.onclick = () => {
          localStorage.removeItem('kdUser');
          updateAuthUI();
          // На главной — показать кнопки после выхода
          const heroButtons = document.getElementById('heroButtons');
          if (heroButtons) heroButtons.style.display = 'flex';
        };
      }
    } else {
      if (accountInfo) accountInfo.classList.remove('active');
      if (authButton) {
        authButton.textContent = 'Войти / Регистрация';
        authButton.onclick = () => window.location.href = 'register.html';
      }
    }
  }

  if (authButton) {
    updateAuthUI();
  }

  // === 3. СТРАНИЦА ПЕРСОНАЖЕЙ ===
  const newCharBtn = document.getElementById('newCharBtn');
  const charModal = document.getElementById('charModal');
  const charForm = document.getElementById('charForm');
  const cancelCharBtn = document.getElementById('cancelCharBtn');
  const charMessage = document.getElementById('charMessage');
  const charactersList = document.getElementById('charactersList');
  const detailContent = document.getElementById('detailContent');
  const emptyDetail = document.getElementById('emptyDetail');
  const deleteCurrentChar = document.getElementById('deleteCurrentChar');

  if (charactersList || newCharBtn) {
    let selectedCharacter = null;

    // Проверка авторизации
    function checkAuth() {
      const user = JSON.parse(localStorage.getItem('kdUser'));
      if (!user) {
        alert('Требуется регистрация для доступа к персонажам.');
        window.location.href = 'register.html';
        return false;
      }
      return true;
    }

    // Инициализация хранилища
    function initCharacters() {
      if (!localStorage.getItem('kdCharacters')) {
        localStorage.setItem('kdCharacters', JSON.stringify([]));
      }
    }

    // Получение персонажей текущего пользователя
    function getUserCharacters() {
      const allChars = JSON.parse(localStorage.getItem('kdCharacters') || '[]');
      const user = JSON.parse(localStorage.getItem('kdUser'));
      return allChars.filter(char => char.owner === user.username);
    }

    // Сохранение персонажа
    function saveCharacterToStorage(char) {
      const allChars = JSON.parse(localStorage.getItem('kdCharacters') || '[]');
      allChars.push(char);
      localStorage.setItem('kdCharacters', JSON.stringify(allChars));
    }

    // Удаление персонажа
    function deleteCharacter(id) {
      let allChars = JSON.parse(localStorage.getItem('kdCharacters') || '[]');
      allChars = allChars.filter(char => char.id !== id);
      localStorage.setItem('kdCharacters', JSON.stringify(allChars));
      renderCharacters();
      if (selectedCharacter && selectedCharacter.id === id) {
        clearDetailPanel();
      }
    }

    // Очистка панели деталей
    function clearDetailPanel() {
      selectedCharacter = null;
      if (emptyDetail) emptyDetail.classList.remove('hidden');
      if (detailContent) detailContent.classList.add('hidden');
    }

    // Отображение списка персонажей
    function renderCharacters() {
      const chars = getUserCharacters();
      if (!charactersList) return;

      if (chars.length === 0) {
        charactersList.innerHTML = `
          <div class="empty-state">
            <p>У вас пока нет персонажей.</p>
            <p style="margin-top: 1rem; font-size: 0.95rem; opacity: 0.8;">
              Нажмите «+ Новый персонаж», чтобы создать первого героя!
            </p>
          </div>
        `;
        return;
      }

      const displayChars = chars.slice(0, 20);
      charactersList.innerHTML = displayChars.map(char => `
        <div class="char-card" data-id="${char.id}">
          <div class="char-avatar">${char.name.charAt(0)}</div>
          <div class="char-name">${char.name}</div>
          <div class="char-class-level">${char.class}, ${char.level} ур.</div>
        </div>
      `).join('');

      document.querySelectorAll('.char-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = parseInt(card.dataset.id);
          selectedCharacter = getUserCharacters().find(c => c.id === id);
          showCharacterDetail(selectedCharacter);
        });
      });
    }

    // Показ деталей персонажа
    function showCharacterDetail(char) {
      if (!char) return;
      document.getElementById('detailAvatar').textContent = char.name.charAt(0);
      document.getElementById('detailName').textContent = char.name;
      document.getElementById('detailClassLevel').textContent = `${char.class}, ${char.level} ур.`;
      document.getElementById('detailRace').textContent = char.race;
      document.getElementById('detailWorld').textContent = char.world || '—';
      document.getElementById('detailHP').textContent = char.hp;
      document.getElementById('detailLevel').textContent = char.level;
      document.getElementById('detailSTR').textContent = char.abilities.str;
      document.getElementById('detailDEX').textContent = char.abilities.dex;
      document.getElementById('detailCON').textContent = char.abilities.con;
      document.getElementById('detailINT').textContent = char.abilities.int;
      document.getElementById('detailWIS').textContent = char.abilities.wis;
      document.getElementById('detailCHA').textContent = char.abilities.cha;
      document.getElementById('detailBackstory').textContent = char.backstory || 'Без описания...';
      if (deleteCurrentChar) deleteCurrentChar.dataset.id = char.id;

      if (emptyDetail) emptyDetail.classList.add('hidden');
      if (detailContent) detailContent.classList.remove('hidden');
    }

    // Обработчики модального окна
    if (newCharBtn) {
      newCharBtn.addEventListener('click', () => {
        if (!checkAuth()) return;
        if (charMessage) {
          charMessage.className = 'message';
          charMessage.textContent = '';
        }
        if (charForm) {
          charForm.reset();
          charForm.querySelector('[name="race"]')?.setAttribute('value', 'Человек');
          charForm.querySelector('[name="class"]')?.setAttribute('value', 'Воин');
          charForm.querySelector('[name="level"]')?.setAttribute('value', '1');
          charForm.querySelector('[name="hp"]')?.setAttribute('value', '10');
          ['str','dex','con','int','wis','cha'].forEach(stat => {
            charForm.querySelector(`[name="${stat}"]`)?.setAttribute('value', '10');
          });
        }
        if (charModal) charModal.classList.remove('hidden');
      });
    }

    if (cancelCharBtn && charModal) {
      cancelCharBtn.addEventListener('click', () => {
        charModal.classList.add('hidden');
      });

      charModal.addEventListener('click', (e) => {
        if (e.target === charModal) {
          charModal.classList.add('hidden');
        }
      });
    }

    if (charForm) {
      charForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('kdUser'));
        const formData = new FormData(charForm);

        const character = {
          id: Date.now(),
          owner: user.username,
          name: formData.get('name'),
          race: formData.get('race'),
          class: formData.get('class'),
          level: parseInt(formData.get('level')),
          hp: parseInt(formData.get('hp')),
          world: formData.get('world') || null,
          abilities: {
            str: parseInt(formData.get('str')) || 10,
            dex: parseInt(formData.get('dex')) || 10,
            con: parseInt(formData.get('con')) || 10,
            int: parseInt(formData.get('int')) || 10,
            wis: parseInt(formData.get('wis')) || 10,
            cha: parseInt(formData.get('cha')) || 10
          },
          backstory: '',
          createdAt: new Date().toISOString()
        };

        saveCharacterToStorage(character);
        if (charMessage) {
          charMessage.textContent = '✅ Персонаж успешно создан!';
          charMessage.className = 'message success';
        }

        setTimeout(() => {
          if (charModal) charModal.classList.add('hidden');
          renderCharacters();
          selectedCharacter = character;
          showCharacterDetail(character);
        }, 800);
      });
    }

    if (deleteCurrentChar) {
      deleteCurrentChar.addEventListener('click', () => {
        if (!selectedCharacter) return;
        if (confirm('Удалить персонажа? Это действие нельзя отменить.')) {
          deleteCharacter(selectedCharacter.id);
        }
      });
    }

    // Инициализация страницы персонажей
    if (checkAuth()) {
      initCharacters();
      renderCharacters();
      clearDetailPanel();
    }
  }
});

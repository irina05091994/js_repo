// DOM элементы
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions');
    const repoList = document.getElementById('repo-list');

    // Хранение добавленных репо
    let addedRepos = [];

    // Debounce функция
    function debounce(func, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    }

    // Поиск репо в GitHub
    async function fetchRepositories(query) {
      if (!query.trim()) {
        hideSuggestions();
        return;
      }

      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        showSuggestions(data.items || []);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        hideSuggestions();
      }
    }

    // Отображение подсказок
    function showSuggestions(repos) {
      if (repos.length === 0) {
        hideSuggestions();
        return;
      }

      suggestionsContainer.innerHTML = '';
      repos.slice(0, 5).forEach(repo => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = repo.full_name;
        item.addEventListener('click', () => {
          addRepoToList(repo);
          searchInput.value = '';
          hideSuggestions();
        });
        suggestionsContainer.appendChild(item);
      });

      suggestionsContainer.style.display = 'block';
    }

    // Скрытие подсказок
    function hideSuggestions() {
      suggestionsContainer.style.display = 'none';
      suggestionsContainer.innerHTML = '';
    }

    // Добавление репо
    function addRepoToList(repo) {
      // Проверка на дубликаты
      if (addedRepos.some(r => r.id === repo.id)) {
        return;
      }

      addedRepos.push(repo);
      renderRepoList();
    }

    // Удаляю репо
    function removeRepoFromList(repoId) {
      addedRepos = addedRepos.filter(repo => repo.id !== repoId);
      renderRepoList();
    }

    
    function renderRepoList() {
      repoList.innerHTML = '';

      addedRepos.forEach(repo => {
        const li = document.createElement('li');
        li.className = 'repo-list__element';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'repo-info';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `Name: ${repo.name}`;

        const ownerSpan = document.createElement('span');
        ownerSpan.textContent = `Owner: ${repo.owner.login}`;

        const starsSpan = document.createElement('span');
        starsSpan.textContent = `Stars: ${repo.stargazers_count}`;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(ownerSpan);
        infoDiv.appendChild(starsSpan);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'X';
        removeBtn.addEventListener('click', () => {
          removeRepoFromList(repo.id);
        });

        li.appendChild(infoDiv);
        li.appendChild(removeBtn);
        repoList.appendChild(li);
      });
    }

    // Обработчик ввода с debounce
    const debouncedFetch = debounce(fetchRepositories, 300);

    searchInput.addEventListener('input', () => {
      const query = searchInput.value;
      if (query.trim() === '') {
        hideSuggestions();
      } else {
        debouncedFetch(query);
      }
    });

    // Скрытие подсказок 
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        hideSuggestions();
      }
    });
const historyEl = document.getElementById('history');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const closeBtn = document.getElementById('closeBtn');

let currentHistory = [];

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function highlightMatch(text, query) {
  if (!query.trim()) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escaped.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createItemElement(item, index) {
  const div = document.createElement('div');
  div.className = 'item paste-hint';
  div.dataset.index = index;

  const query = searchInput.value.trim().toLowerCase();
  const matchesSearch = !query || 
    (item.type === 'text' && item.data.toLowerCase().includes(query)) ||
    (item.type === 'image' && query === '');

  if (!matchesSearch) {
    div.style.display = 'none';
  }

  if (item.type === 'image') {
    div.innerHTML = `
      <img src="${item.data}" alt="Clipboard image" class="item-thumbnail">
      <div class="item-content">
        <div class="item-type">Image</div>
        <div class="item-preview image-preview">Copied image</div>
      </div>
      <div class="item-actions">
        <button class="item-btn paste-btn" data-index="${index}" title="Paste">↵</button>
        <button class="item-btn delete-btn" data-index="${index}" title="Delete">⌫</button>
      </div>
    `;
  } else {
    const preview = highlightMatch(item.preview, query);
    div.innerHTML = `
      <div class="item-content">
        <div class="item-type">Text</div>
        <div class="item-preview">${preview}</div>
      </div>
      <div class="item-actions">
        <button class="item-btn paste-btn" data-index="${index}" title="Paste">↵</button>
        <button class="item-btn delete-btn" data-index="${index}" title="Delete">⌫</button>
      </div>
    `;
  }

  div.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      e.stopPropagation();
      e.preventDefault();
      window.clipboardAPI.deleteItem(parseInt(deleteBtn.dataset.index));
      return;
    }
    e.preventDefault();
    const idx = parseInt(e.currentTarget.dataset.index);
    if (!isNaN(idx)) {
      window.clipboardAPI.pasteItem(idx);
    }
  });

  return div;
}

function renderHistory(history) {
  currentHistory = history || [];
  emptyState.classList.toggle('hidden', currentHistory.length > 0);

  const existingItems = historyEl.querySelectorAll('.item');
  existingItems.forEach(el => el.remove());

  currentHistory.forEach((item, index) => {
    historyEl.appendChild(createItemElement(item, index));
  });
}

function filterHistory() {
  const query = searchInput.value.trim().toLowerCase();
  const items = historyEl.querySelectorAll('.item');
  
  items.forEach((el, index) => {
    const item = currentHistory[index];
    if (!item) return;
    
    const matches = !query || 
      (item.type === 'text' && item.data.toLowerCase().includes(query)) ||
      (item.type === 'image' && query === '');
    
    el.style.display = matches ? '' : 'none';
    if (matches && item.type === 'text') {
      const previewEl = el.querySelector('.item-preview');
      if (previewEl) {
        previewEl.innerHTML = highlightMatch(item.preview, query);
      }
    }
  });
}

closeBtn.addEventListener('click', () => {
  window.clipboardAPI.closeWindow();
});

searchInput.addEventListener('input', filterHistory);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    searchInput.blur();
    filterHistory();
  }
});

window.clipboardAPI.onClipboardUpdated(renderHistory);

window.clipboardAPI.getHistory().then(renderHistory);

document.addEventListener('DOMContentLoaded', () => {
  searchInput.focus();
});

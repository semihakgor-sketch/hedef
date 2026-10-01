const stages = [
  [100000, 'Başlangıç', 1],
  [150000, '+%50', 1.5],
  [200000, '+%33', 2],
  [300000, '+%50', 3],
  [400000, '+%33', 4],
  [600000, '+%50', 6],
  [800000, '+%33', 8],
  [1200000, '+%50', 12],
  [1600000, '+%33', 16],
  [2000000, '+%25', 2.5],
  [2500000, '+%25', 2.5],
  [3000000, '+%20', 3],
  [4000000, 'Hedef', 4]
];

const checklist = [
  'Net hedef belirle',
  'Risk yönetimini yap',
  'Sermayeyi koru',
  'Sürekli öğren',
  'Sabırlı ve disiplinli ol',
  'Stratejiye sadık kal',
  'Duygularını kontrol et',
  'Hedefe odaklan ve vazgeçme'
];

const stateKey = 'hedef40';
let state = {};

try {
  state = JSON.parse(localStorage.getItem(stateKey) || '{}');
} catch (error) {
  state = {};
}

function saveState() {
  try {
    localStorage.setItem(stateKey, JSON.stringify(state));
  } catch (error) {
    // no-op
  }
}

function formatTL(value) {
  return `${Number(value).toLocaleString('tr-TR')} TL`;
}

function formatUSD(value) {
  return `$${Math.round(value / 49).toLocaleString('en-US')}`;
}

function createRow(id, markup) {
  const label = document.createElement('label');
  label.className = 'task';
  label.innerHTML = `<input type="checkbox">${markup}`;

  const input = label.querySelector('input');
  input.checked = !!state[id];

  input.addEventListener('change', () => {
    state[id] = input.checked;
    saveState();
    updateProgress();
  });

  label.dataset.id = id;
  return label;
}

function renderStages() {
  const container = document.getElementById('stages');

  stages.forEach((stage, index) => {
    const [amount, labelText, multiplier] = stage;
    const row = createRow(
      `s${index}`,
      `<span class="num">${index + 1}</span><span class="meta"><b>${formatTL(amount)}</b><span>${labelText} · ${formatUSD(amount)}</span></span><span class="mult">${multiplier}x</span>`
    );
    container.appendChild(row);
  });
}

function renderChecklist() {
  const container = document.getElementById('check');

  checklist.forEach((text, index) => {
    const row = createRow(
      `c${index}`,
      `<span class="meta"><b style="font-size:15px;font-weight:500">${text}</b></span>`
    );
    container.appendChild(row);
  });
}

function updateProgress() {
  let completed = 0;
  let next = null;

  stages.forEach((_, index) => {
    if (state[`s${index}`]) {
      completed += 1;
    } else if (next === null) {
      next = stages[index][0];
    }
  });

  document.getElementById('cnt').textContent = `${completed}/13`;
  document.getElementById('fill').style.width = `${(completed / 13) * 100}%`;
  document.getElementById('cur').textContent = next ? `Sıradaki hedef: ${formatTL(next)}` : '🎉 Hedef tamam!';
}

function bindResetButton() {
  const button = document.getElementById('reset');
  let timer;

  button.addEventListener('click', () => {
    if (button.dataset.arm !== '1') {
      button.dataset.arm = '1';
      button.textContent = 'Emin misin? Tekrar dokun';
      timer = setTimeout(() => {
        button.dataset.arm = '';
        button.textContent = 'Hepsini sıfırla';
      }, 3000);
      return;
    }

    clearTimeout(timer);
    button.dataset.arm = '';
    button.textContent = 'Hepsini sıfırla';
    state = {};
    saveState();

    document.querySelectorAll('.task input').forEach((input) => {
      input.checked = false;
    });

    updateProgress();
  });
}

function bindLockScreen() {
  const lock = document.getElementById('lock');
  const pin = document.getElementById('pin');
  const err = document.getElementById('lerr');
  const unlockButton = document.getElementById('unlock');

  const unlock = () => {
    if (pin.value === '2712') {
      try {
        sessionStorage.setItem('unl', '1');
      } catch (error) {
        // no-op
      }
      lock.classList.add('off');
      pin.value = '';
      err.textContent = '';
      return;
    }

    if (pin.value.length >= 4) {
      err.textContent = 'Yanlış şifre';
      pin.value = '';
    }
  };

  try {
    if (sessionStorage.getItem('unl') === '1') {
      lock.classList.add('off');
    }
  } catch (error) {
    // no-op
  }

  pin.addEventListener('input', () => {
    err.textContent = '';
    if (pin.value.length === 4) {
      unlock();
    }
  });

  pin.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      unlock();
    }
  });

  unlockButton.addEventListener('click', () => {
    if (pin.value.length < 4) {
      err.textContent = '4 haneli şifreyi gir';
      return;
    }
    unlock();
  });
}

renderStages();
renderChecklist();
bindResetButton();
bindLockScreen();
updateProgress();

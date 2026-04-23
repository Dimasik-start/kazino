// ========== TELEGRAM SDK ==========
let tg = window.Telegram.WebApp;
tg.expand();

let user = tg.initDataUnsafe.user;
let usernameEl = document.getElementById('username');
let avatarEl = document.getElementById('avatar');

if (user) {
    usernameEl.textContent = user.first_name;
    if (user.photo_url) {
        avatarEl.src = user.photo_url;
    } else {
        avatarEl.src = 'https://ui-avatars.com/api/?name=' + user.first_name + '&background=3b82f6&color=fff';
    }
} else {
    usernameEl.textContent = 'ГОСТЬ';
    avatarEl.src = 'https://ui-avatars.com/api/?name=GUEST&background=3b82f6&color=fff';
}

// ========== ТЕСТОВЫЙ БАЛАНС ==========
document.getElementById('goldBalance').textContent = '100';
document.getElementById('silverBalance').textContent = '50';

// ========== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ==========
let играть = document.getElementById("gamesSection");
let профиль = document.getElementById("profileSection");
let задание = document.getElementById("tasksSection");
let пополнение = document.getElementById("depositSection");

let кнопкаиграть = document.getElementById("nav-play");
let кнопкапрофиль = document.getElementById("nav-profile");
let кнопказадание = document.getElementById("nav-tasks");
let кнопкапополнение = document.getElementById("nav-deposit");

// ========== ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ ==========
function спрятатьвсе() {
    играть.style.display = "none";
    профиль.style.display = "none";
    задание.style.display = "none";
    пополнение.style.display = "none";
}

function убратьвсе() {
    кнопкаиграть.classList.remove("active");
    кнопкапрофиль.classList.remove("active");
    кнопказадание.classList.remove("active");
    кнопкапополнение.classList.remove("active");
}

function раздел(selection) {
    спрятатьвсе();
    убратьвсе();
    if (selection === "games") {
        играть.style.display = "block";
        кнопкаиграть.classList.add("active");
    }
    if (selection === "profile") {
        профиль.style.display = "block";
        кнопкапрофиль.classList.add("active");
    }
    if (selection === "tasks") {
        задание.style.display = "block";
        кнопказадание.classList.add("active");
    }
    if (selection === "deposit") {
        пополнение.style.display = "block";
        кнопкапополнение.classList.add("active");
    }
}

// ========== ОБРАБОТЧИКИ МЕНЮ ==========
кнопкаиграть.addEventListener("click", () => раздел("games"));
кнопкапрофиль.addEventListener("click", () => раздел("profile"));
кнопказадание.addEventListener("click", () => раздел("tasks"));
кнопкапополнение.addEventListener("click", () => раздел("deposit"));

document.getElementById("depositBtn").addEventListener("click", () => раздел("deposit"));

// ========== ИГРА "РАКЕТА" ==========
const rocketGame = document.getElementById('rocketGame');
const rocketBackBtn = document.getElementById('rocketBackBtn');
const rocketBetBtn = document.getElementById('rocketBetBtn');
const rocketCashoutBtn = document.getElementById('rocketCashoutBtn');
const rocketGoldBalance = document.getElementById('rocketGoldBalance');
const rocketMultiplier = document.getElementById('rocketMultiplier');
const rocketStatus = document.getElementById('rocketStatus');
const rocketHistory = document.getElementById('rocketHistory');
const rocketPlayers = document.getElementById('rocketPlayers');
const rocketCanvas = document.getElementById('rocketCanvas');
const rocketWin = document.getElementById('rocketWin');
const ctx = rocketCanvas.getContext('2d');

const betOverlay = document.getElementById('betOverlay');
const betAmountInput = document.getElementById('betAmountInput');
const betGoldBtn = document.getElementById('betGoldBtn');
const betSilverBtn = document.getElementById('betSilverBtn');
const betMaxBtn = document.getElementById('betMaxBtn');
const betConfirmBtn = document.getElementById('betConfirmBtn');
const betDepositBtn = document.getElementById('betDepositBtn');
const betTasksBtn = document.getElementById('betTasksBtn');

let currentMultiplier = 1.0;
let isGameRunning = false;
let selectedCurrency = 'gold';
let playerBet = 0;
let gameInterval = null;
let gameTimeout = null;

// ========== ОТКРЫТИЕ / ЗАКРЫТИЕ ==========
function openRocketGame() {
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.bottom-nav').style.display = 'none';
    спрятатьвсе();
    rocketGame.style.display = 'flex';
    rocketGoldBalance.textContent = document.getElementById('goldBalance').textContent;
    resetGame();
}

function closeRocketGame() {
    document.querySelector('.header').style.display = 'flex';
    document.querySelector('.bottom-nav').style.display = 'flex';
    rocketGame.style.display = 'none';
    // Очистка таймеров при выходе
    if (gameInterval) clearInterval(gameInterval);
    if (gameTimeout) clearTimeout(gameTimeout);
    раздел('games');
}

document.getElementById('game-rocket').addEventListener('click', openRocketGame);
rocketBackBtn.addEventListener('click', closeRocketGame);

// ========== ВСПЛЫВАЮЩЕЕ ОКНО ==========
rocketBetBtn.addEventListener('click', () => {
    betOverlay.style.display = 'flex';
    updateBetMax();
    checkBalanceButtons();
});

betGoldBtn.addEventListener('click', () => {
    betGoldBtn.classList.add('active');
    betSilverBtn.classList.remove('active');
    selectedCurrency = 'gold';
    updateBetMax();
    checkBalanceButtons();
});

betSilverBtn.addEventListener('click', () => {
    betSilverBtn.classList.add('active');
    betGoldBtn.classList.remove('active');
    selectedCurrency = 'silver';
    updateBetMax();
    checkBalanceButtons();
});

betMaxBtn.addEventListener('click', () => {
    betAmountInput.value = getBalance(selectedCurrency);
    checkBalanceButtons();
});

function getBalance(currency) {
    let el = currency === 'gold' ? document.getElementById('goldBalance') : document.getElementById('silverBalance');
    return parseInt(el.textContent.replace(/\D/g, '')) || 0;
}

function updateBetMax() {
    betAmountInput.max = getBalance(selectedCurrency);
    let val = parseInt(betAmountInput.value) || 0;
    if (val > betAmountInput.max) betAmountInput.value = betAmountInput.max;
    if (val < 10) betAmountInput.value = 10;
}

function checkBalanceButtons() {
    let balance = getBalance(selectedCurrency);
    let amount = parseInt(betAmountInput.value) || 0;
    if (amount > balance || balance < 10) {
        betConfirmBtn.style.display = 'none';
        if (selectedCurrency === 'gold') {
            betDepositBtn.style.display = 'block';
            betTasksBtn.style.display = 'none';
        } else {
            betDepositBtn.style.display = 'none';
            betTasksBtn.style.display = 'block';
        }
    } else {
        betConfirmBtn.style.display = 'block';
        betDepositBtn.style.display = 'none';
        betTasksBtn.style.display = 'none';
    }
}

betAmountInput.addEventListener('input', checkBalanceButtons);

function changeBet(amount) {
    let current = parseInt(betAmountInput.value) || 0;
    let newAmount = current + amount;
    if (newAmount < 10) newAmount = 10;
    if (newAmount > betAmountInput.max) newAmount = betAmountInput.max;
    betAmountInput.value = newAmount;
    checkBalanceButtons();
}

betDepositBtn.addEventListener('click', () => {
    betOverlay.style.display = 'none';
    closeRocketGame();
    раздел('deposit');
});

betTasksBtn.addEventListener('click', () => {
    betOverlay.style.display = 'none';
    closeRocketGame();
    раздел('tasks');
});

betConfirmBtn.addEventListener('click', () => {
    playerBet = parseInt(betAmountInput.value);
    let balance = getBalance(selectedCurrency);
    if (selectedCurrency === 'gold') {
        document.getElementById('goldBalance').textContent = balance - playerBet;
    } else {
        document.getElementById('silverBalance').textContent = balance - playerBet;
    }
    rocketGoldBalance.textContent = document.getElementById('goldBalance').textContent;
    betOverlay.style.display = 'none';
    rocketBetBtn.style.display = 'none';
    rocketCashoutBtn.style.display = 'block';
    rocketWin.textContent = '0 🪙';
});

// ========== ЛОГИКА ИГРЫ ==========
function resetGame() {
    if (gameInterval) clearInterval(gameInterval);
    if (gameTimeout) clearTimeout(gameTimeout);
    
    currentMultiplier = 1.0;
    isGameRunning = false;
    playerBet = 0;
    rocketMultiplier.textContent = '1.00x';
    rocketMultiplier.classList.remove('crashed');
    rocketStatus.textContent = 'ОЖИДАНИЕ СТАВОК';
    rocketBetBtn.style.display = 'block';
    rocketCashoutBtn.style.display = 'none';
    rocketWin.textContent = '0 🪙';
    drawRocket(0);
    
    // Автозапуск через 3 секунды
    gameTimeout = setTimeout(autoStartGame, 3000);
}

function autoStartGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    currentMultiplier = 1.0;
    rocketStatus.textContent = 'ЛЕТИТ';
    
    let crashAt = Math.random() * 4 + 1; // от 1x до 5x
    
    gameInterval = setInterval(() => {
        if (!isGameRunning) {
            clearInterval(gameInterval);
            return;
        }
        currentMultiplier += 0.03;
        rocketMultiplier.textContent = currentMultiplier.toFixed(2) + 'x';
        drawRocket(currentMultiplier);
        
        // Обновление потенциального выигрыша игрока
        if (playerBet > 0) {
            rocketWin.textContent = Math.floor(playerBet * currentMultiplier) + ' 🪙';
        }
        
        if (currentMultiplier >= crashAt) {
            crashAuto();
        }
    }, 100);
}

function crashAuto() {
    if (gameInterval) clearInterval(gameInterval);
    isGameRunning = false;
    rocketMultiplier.classList.add('crashed');
    rocketStatus.textContent = 'КРАХ! ' + currentMultiplier.toFixed(2) + 'x';
    rocketCashoutBtn.style.display = 'none';
    
    // Если игрок не забрал ставку — проигрыш
    if (playerBet > 0) {
        updatePlayerStatus('ВЫ', 'lose');
    }
    
    addHistoryItem(currentMultiplier.toFixed(2) + 'x', 'red');
    
    // 10 секунд перерыв
    gameTimeout = setTimeout(resetGame, 10000);
}

// Кнопка "Забрать"
rocketCashoutBtn.addEventListener('click', () => {
    if (!isGameRunning) return;
    isGameRunning = false;
    if (gameInterval) clearInterval(gameInterval);
    
    let winAmount = Math.floor(playerBet * currentMultiplier);
    
    // Начисление выигрыша
    let currentGold = parseInt(document.getElementById('goldBalance').textContent) || 0;
    document.getElementById('goldBalance').textContent = currentGold + winAmount;
    rocketGoldBalance.textContent = document.getElementById('goldBalance').textContent;
    
    rocketStatus.textContent = 'ВЫИГРЫШ: ' + winAmount + ' 🪙 (' + currentMultiplier.toFixed(2) + 'x)';
    rocketCashoutBtn.style.display = 'none';
    
    updatePlayerStatus('ВЫ', 'win');
    addHistoryItem(currentMultiplier.toFixed(2) + 'x', 'green');
    
    playerBet = 0;
    // Ждём до окончания раунда
});

// ========== ОТРИСОВКА ==========
function drawRocket(mult) {
    rocketCanvas.width = rocketCanvas.parentElement.clientWidth;
    rocketCanvas.height = rocketCanvas.parentElement.clientHeight;
    ctx.clearRect(0, 0, rocketCanvas.width, rocketCanvas.height);
    
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        let x = (i / 10) * rocketCanvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rocketCanvas.height);
        ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.strokeStyle = currentMultiplier >= 5 ? '#ef4444' : '#10b981';
    ctx.lineWidth = 3;
    for (let x = 0; x < rocketCanvas.width; x++) {
        let progress = x / rocketCanvas.width;
        let y = rocketCanvas.height - Math.pow(progress * Math.min(mult, 10), 1.8) * rocketCanvas.height * 0.7;
        if (x === 0) ctx.moveTo(x, rocketCanvas.height);
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    let progress = Math.min(mult / 10, 0.95);
    let rx = progress * rocketCanvas.width;
    let ry = rocketCanvas.height - Math.pow(progress * Math.min(mult, 10), 1.8) * rocketCanvas.height * 0.7 - 30;
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🚀', rx, ry);
}

// ========== ИСТОРИЯ И ИГРОКИ ==========
function addHistoryItem(text, color) {
    let span = document.createElement('span');
    span.className = 'rocket-history-item ' + color;
    span.textContent = text;
    rocketHistory.prepend(span);
    if (rocketHistory.children.length > 10) rocketHistory.lastChild.remove();
}

function addPlayer(name, bet, status) {
    let div = document.createElement('div');
    div.className = 'rocket-player';
    div.innerHTML = `
        <span>👤 ${name}</span>
        <span>${bet} 🪙</span>
        <span class="rocket-player-status ${status}">${status === 'waiting' ? 'СТАВКА' : status === 'win' ? 'ВЫИГРАЛ' : 'ПРОИГРАЛ'}</span>
    `;
    rocketPlayers.prepend(div);
}

function updatePlayerStatus(name, status) {
    for (let p of rocketPlayers.children) {
        if (p.textContent.includes(name)) {
            let statusEl = p.querySelector('.rocket-player-status');
            statusEl.className = 'rocket-player-status ' + status;
            statusEl.textContent = status === 'win' ? 'ВЫИГРАЛ' : 'ПРОИГРАЛ';
        }
    }
}

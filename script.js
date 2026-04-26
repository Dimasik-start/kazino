// ========== TELEGRAM SDK ==========
let tg = window.Telegram.WebApp;
tg.expand();
let user = tg.initDataUnsafe.user;
let usernameEl = document.getElementById('username');
let avatarEl = document.getElementById('avatar');

if (user) {
    usernameEl.textContent = user.first_name || 'Игрок';
    if (user.photo_url) {
        avatarEl.src = user.photo_url;
    } else {
        avatarEl.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.first_name || 'G') + '&background=3b82f6&color=fff';
    }
} else {
    usernameEl.textContent = 'ГОСТЬ';
    avatarEl.src = 'https://ui-avatars.com/api/?name=GUEST&background=3b82f6&color=fff';
}

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ИНТЕРФЕЙСА ==========
let играть = document.getElementById("gamesSection");
let профиль = document.getElementById("profileSection");
let задание = document.getElementById("tasksSection");
let пополнение = document.getElementById("depositSection");

let кнопкаиграть = document.getElementById("nav-play");
let кнопкапрофиль = document.getElementById("nav-profile");
let кнопказадание = document.getElementById("nav-tasks");
let кнопкапополнение = document.getElementById("nav-deposit");

// ========== ПЕРЕКЛЮЧЕНИЕ СЕКЦИЙ ==========
function спрятатьвсе() {
    играть.style.display = "none";
    профиль.style.display = "none";
    задание.style.display = "none";
    пополнение.style.display = "none";
    let bombGame = document.getElementById('bombGame');
    if (bombGame) bombGame.style.display = "none";
    let rocketGame = document.getElementById('rocketGame');
    if (rocketGame) rocketGame.style.display = "none";
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
    } else if (selection === "profile") {
        профиль.style.display = "block";
        кнопкапрофиль.classList.add("active");
    } else if (selection === "tasks") {
        задание.style.display = "block";
        кнопказадание.classList.add("active");
    } else if (selection === "deposit") {
        пополнение.style.display = "block";
        кнопкапополнение.classList.add("active");
    }
}

кнопкаиграть.addEventListener("click", () => раздел("games"));
кнопкапрофиль.addEventListener("click", () => раздел("profile"));
кнопказадание.addEventListener("click", () => раздел("tasks"));
кнопкапополнение.addEventListener("click", () => раздел("deposit"));
document.getElementById("depositBtn").addEventListener("click", () => раздел("deposit"));

// ========== ТЕСТОВЫЙ БАЛАНС (пока сервер не обновил) ==========
document.getElementById('goldBalance').textContent = '100';
document.getElementById('silverBalance').textContent = '50';

// ========== ИГРА "РАКЕТА" (СЕРВЕРНАЯ) ==========
const rocketGame = document.getElementById('rocketGame');
const rocketBackBtn = document.getElementById('rocketBackBtn');
const rocketBetBtn = document.getElementById('rocketBetBtn');
const rocketCashoutBtn = document.getElementById('rocketCashoutBtn');
const rocketGoldBalance = document.getElementById('rocketGoldBalance');
const rocketMultiplier = document.getElementById('rocketMultiplier');
const rocketTimer = document.getElementById('rocketTimer');
const rocketHistory = document.getElementById('rocketHistory');
const rocketPlayers = document.getElementById('rocketPlayers');
const rocketCanvas = document.getElementById('rocketCanvas');
const ctx = rocketCanvas.getContext('2d');

// Модальное окно ставки (твоя вёрстка)
const betOverlay = document.getElementById('betOverlay');
const betAmountInput = document.getElementById('betAmountInput');
const betGoldBtn = document.getElementById('betGoldBtn');
const betSilverBtn = document.getElementById('betSilverBtn');
const betMaxBtn = document.getElementById('betMaxBtn');
const betConfirmBtn = document.getElementById('betConfirmBtn');
const betDepositBtn = document.getElementById('betDepositBtn');
const betTasksBtn = document.getElementById('betTasksBtn');

// WebSocket и состояние
const WS_URL = "wss://ngrok.com/docs/errors/err_ngrok_4018/ws/";  // <-- замени на свой VPS
let ws = null;
let userId = user ? user.id.toString() : 'guest';
let currentMultiplier = 1.0;
let isGameRunning = false;
let gameCrashed = false;
let bettingActive = false;
let playerBetAmount = 0;
let selectedCurrency = 'gold';

// Canvas размеры
function resizeCanvas() {
    rocketCanvas.width = rocketCanvas.parentElement.clientWidth || 300;
    rocketCanvas.height = rocketCanvas.parentElement.clientHeight || 250;
}
window.addEventListener('resize', resizeCanvas);

// ========== ПОДКЛЮЧЕНИЕ К СЕРВЕРУ ==========
function connectWebSocket() {
    ws = new WebSocket(WS_URL + userId);
    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
    };
    ws.onclose = () => {
        console.log('WebSocket disconnected, retry in 3s...');
        setTimeout(connectWebSocket, 3000);
    };
    ws.onerror = (err) => console.error('WebSocket error:', err);
}

function handleServerMessage(msg) {
    switch (msg.type) {
        case "new_round":
            resetGameForNewRound();
            startBettingTimer(msg.betting_seconds);
            break;
        case "multiplier":
            currentMultiplier = msg.value;
            updateMultiplierDisplay();
            drawRocket(currentMultiplier, false);
            break;
        case "crashed":
            gameCrashed = true;
            isGameRunning = false;
            updateMultiplierDisplay();
            drawRocket(msg.value, true); // взрыв
            rocketBetBtn.style.display = 'none';
            rocketCashoutBtn.style.display = 'none';
            addHistoryItem(msg.value);
            break;
        case "bet_accepted":
            playerBetAmount = parseInt(betAmountInput.value) || 0;
            rocketGoldBalance.textContent = msg.balance;
            document.getElementById('goldBalance').textContent = msg.balance;
            rocketBetBtn.style.display = 'none';
            rocketCashoutBtn.style.display = 'block';
            document.getElementById('rocketWin').textContent = '0 🪙';
            break;
        case "cashout_success":
            alert(`✅ Выигрыш: ${msg.win} 🪙 (x${msg.multiplier})`);
            break;
        case "error":
            alert('❌ ' + msg.message);
            break;
        case "results":
            updatePlayersList(msg.bets);
            break;
    }
}

// ========== ТАЙМЕР СТАВОК ==========
let timerInterval = null;
function startBettingTimer(seconds) {
    let remaining = seconds;
    bettingActive = true;
    rocketBetBtn.style.display = 'block';
    rocketCashoutBtn.style.display = 'none';
    rocketTimer.style.display = 'block';
    rocketTimer.textContent = `Ставки до ${remaining}с`;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(timerInterval);
            bettingActive = false;
            rocketTimer.textContent = '🚀 Полёт!';
            rocketBetBtn.style.display = 'none'; // уже не даём ставить
        } else {
            rocketTimer.textContent = `Ставки до ${remaining}с`;
        }
    }, 1000);
}

// ========== ОТРИСОВКА РАКЕТЫ И ГРАФИКА ==========
function drawRocket(multiplier, isCrash) {
    resizeCanvas();
    ctx.clearRect(0, 0, rocketCanvas.width, rocketCanvas.height);
    const w = rocketCanvas.width;
    const h = rocketCanvas.height;

    // Сетка
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        let x = (i / 10) * w;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    // Кривая роста
    const maxDrawX = isCrash ? w : (Math.min(multiplier, 10) / 10) * w;
    ctx.beginPath();
    ctx.strokeStyle = isCrash ? '#ef4444' : '#10b981';
    ctx.lineWidth = 3;
    ctx.moveTo(0, h);
    for (let x = 0; x <= maxDrawX; x += 2) {
        let progress = x / w;
        let y = h - Math.pow(progress * Math.min(multiplier, 10), 1.5) * h * 0.7;
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Ракета (летит по кривой)
    if (!isCrash) {
        let progress = Math.min(multiplier / 10, 0.95);
        let rx = progress * w;
        let ry = h - Math.pow(progress * Math.min(multiplier, 10), 1.5) * h * 0.7;
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚀', rx, ry - 20);
    } else {
        // Взрыв (простые частицы)
        for (let i = 0; i < 20; i++) {
            let angle = Math.random() * Math.PI * 2;
            let dist = Math.random() * 60;
            let x = w * 0.7 + Math.cos(angle) * dist;
            let y = h * 0.3 + Math.sin(angle) * dist;
            ctx.fillStyle = `hsl(${Math.random() * 60}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Множитель с пульсацией
function updateMultiplierDisplay() {
    rocketMultiplier.textContent = currentMultiplier.toFixed(2) + 'x';
    if (gameCrashed) {
        rocketMultiplier.classList.add('crashed');
    } else {
        rocketMultiplier.classList.remove('crashed');
    }
}

// История раундов
function addHistoryItem(crashValue) {
    let span = document.createElement('span');
    span.className = 'rocket-history-item';
    span.textContent = crashValue.toFixed(2) + 'x';
    rocketHistory.prepend(span);
    if (rocketHistory.children.length > 15) rocketHistory.lastChild.remove();
}

// Список игроков
function updatePlayersList(bets) {
    rocketPlayers.innerHTML = '';
    for (const [uid, bet] of Object.entries(bets)) {
        let div = document.createElement('div');
        div.className = 'rocket-player';
        let status = bet.cashed_out ? '✅ Выиграл' : '❌ Проиграл';
        div.innerHTML = `<span>👤 ${uid}</span><span>${bet.amount} 🪙</span><span class="rocket-player-status">${status}</span>`;
        rocketPlayers.appendChild(div);
    }
}

// ========== СТАВКИ (модальное окно) ==========
rocketBetBtn.addEventListener('click', () => {
    if (!bettingActive) {
        alert('Ставки принимаются только до начала раунда!');
        return;
    }
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
betMaxBtn.addEventListener('click', () => {
    betAmountInput.value = getBalance(selectedCurrency);
    checkBalanceButtons();
});

window.changeBet = function(delta) {
    // вызывается из HTML
    let current = parseInt(betAmountInput.value) || 0;
    let newVal = current + delta;
    if (newVal < 10) newVal = 10;
    if (newVal > betAmountInput.max) newVal = betAmountInput.max;
    betAmountInput.value = newVal;
    checkBalanceButtons();
};

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
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert('Соединение с сервером потеряно');
        return;
    }
    let amount = parseInt(betAmountInput.value);
    if (isNaN(amount) || amount < 10) return alert('Минимальная ставка 10');
    let balance = getBalance(selectedCurrency);
    if (amount > balance) return alert('Недостаточно средств');
    // Отправляем ставку на сервер
    ws.send(JSON.stringify({
        type: "place_bet",
        user_id: userId,
        amount: amount,
        currency: selectedCurrency,
        username: user ? user.first_name : 'Гость'
    }));
    betOverlay.style.display = 'none';
});

// ========== ОТКРЫТИЕ/ЗАКРЫТИЕ ИГРЫ ==========
function openRocketGame() {
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.bottom-nav').style.display = 'none';
    спрятатьвсе();
    rocketGame.style.display = 'flex';
    rocketGoldBalance.textContent = document.getElementById('goldBalance').textContent;
    // сбрасываем UI
    resetGameUI();
    connectWebSocket(); // подключаемся к серверу (если ещё не)
}

function closeRocketGame() {
    document.querySelector('.header').style.display = 'flex';
    document.querySelector('.bottom-nav').style.display = 'flex';
    rocketGame.style.display = 'none';
    if (ws) {
        ws.close();
        ws = null;
    }
    if (timerInterval) clearInterval(timerInterval);
    раздел('games');
}

function resetGameUI() {
    currentMultiplier = 1.0;
    isGameRunning = false;
    gameCrashed = false;
    bettingActive = false;
    playerBetAmount = 0;
    rocketMultiplier.textContent = '1.00x';
    rocketMultiplier.classList.remove('crashed');
    rocketTimer.textContent = '';
    rocketBetBtn.style.display = 'none';
    rocketCashoutBtn.style.display = 'none';
    document.getElementById('rocketWin').textContent = '0 🪙';
    drawRocket(1.0, false);
}

function resetGameForNewRound() {
    currentMultiplier = 1.0;
    gameCrashed = false;
    isGameRunning = false;
    playerBetAmount = 0;
    rocketMultiplier.textContent = '1.00x';
    rocketMultiplier.classList.remove('crashed');
    rocketBetBtn.style.display = 'block'; // покажут таймер, но кнопка ставки будет активна
    rocketCashoutBtn.style.display = 'none';
    document.getElementById('rocketWin').textContent = '0 🪙';
    drawRocket(1.0, false);
}

// Кнопка «Забрать»
rocketCashoutBtn.addEventListener('click', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "cashout" }));
        rocketCashoutBtn.style.display = 'none';
    }
});

// Открыть игру с главного экрана
document.getElementById('game-rocket').addEventListener('click', openRocketGame);
rocketBackBtn.addEventListener('click', closeRocketGame);

// ========== ИГРА "БОМБА" (заглушка) ==========
document.getElementById('game-bomb')?.addEventListener('click', () => {
    alert('Игра Бомба в разработке');
});

// ========== ПЕРВИЧНОЕ ОТКРЫТИЕ ==========
раздел('games');

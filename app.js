
const firebaseConfig = {
    apiKey: "AIzaSyCLg36PFXKeeL54CEqeTJ2esXieHuod4Oo",
    authDomain: "trix-116e9.firebaseapp.com",
    databaseURL: "https://trix-116e9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "trix-116e9",
    storageBucket: "trix-116e9.firebasestorage.app",
    messagingSenderId: "892482593960",
    appId: "1:892482593960:web:d89ae74b42d8265c574e9d",
    measurementId: "G-44B6QK65VR"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const REF_CODE = "Novexref";
const RUGS_REF_LINK = `https://rugs.fun/?start=REF_NBKE55F0Y2Y4`;
const ORACL_REF_LINK = "https://www.oracl.fun/leaderboard/6e1d1369-622f-4e25-ba43-84d37eb9da08"; 

const ENCODED_PASS = "R0BkaXNncmVhdDExMjA="; 

function animatedNav(url) {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = url;
    }, 500); 
}

function attemptLogin() {
    const rawInput = document.getElementById('admin-pass').value;
    const input = rawInput ? rawInput.trim() : "";

    const encodedInput = btoa(input);

    console.log("Input:", input);
    console.log("Encoded:", encodedInput);
    console.log("Expected:", ENCODED_PASS);

    if (encodedInput === ENCODED_PASS) {
        sessionStorage.setItem('novexAdmin', 'true');
        location.reload();
    } else {
        alert("ACCESS DENIED");
    }
}

function goToRugs() { window.location.href = RUGS_REF_LINK; }
function goToOracl() { window.location.href = ORACL_REF_LINK; }

function renderSelectionStatus() {
    db.ref('config/status').on('value', (snap) => {
        const s = snap.val() || { rugs: 'LIVE', oracl: 'LIVE' };
        const rugsBadge = document.getElementById('indicator-rugs');
        const oraclBadge = document.getElementById('indicator-oracl');
        if(rugsBadge) {
            rugsBadge.innerHTML = s.rugs === 'LIVE' ? '泙 LIVE NOW' : '閥 NOT ACTIVE';
            rugsBadge.className = s.rugs === 'LIVE' ? 'status-badge live' : 'status-badge offline';
        }
        if(oraclBadge) {
            oraclBadge.innerHTML = s.oracl === 'LIVE' ? '泙 LIVE NOW' : '閥 NOT ACTIVE';
            oraclBadge.className = s.oracl === 'LIVE' ? 'status-badge live' : 'status-badge offline';
        }
    });
}

function startFallingEffect() {
    const container = document.getElementById('falling-container');
    if(!container) return;
    setInterval(() => {
        const el = document.createElement('div');
        el.className = 'falling-item';
        el.innerHTML = `<img src="images/logo.png" style="width: 30px; opacity: 0.6; filter: drop-shadow(0 0 5px #FFFF00);">`;
        el.style.left = Math.random() * 95 + 'vw';
        el.style.animationDuration = Math.random() * 3 + 4 + 's';
        container.appendChild(el);
        setTimeout(() => el.remove(), 7000);
    }, 800);
}

function processCSV() {
    const file = document.getElementById('csv-file').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const lines = e.target.result.split('\n').slice(1);
        const data = lines.map(line => {
            const c = line.split(',').map(s => s.replace(/"/g, '').trim());
            return c[0] ? { username: c[0], level: parseInt(c[1])||0, joined: c[2] } : null;
        }).filter(Boolean);
        data.sort((a, b) => b.level - a.level);
        db.ref('leaderboardData').set(data).then(() => {
            document.getElementById('upload-status').innerText = "LIVE SYNC COMPLETE!";
        });
    };
    reader.readAsText(file);
}

function renderRugsLeaderboard() {
    db.ref().on('value', (snap) => {
        const val = snap.val();
        if(!val) return;
        const data = val.leaderboardData || [];
        const prizes = (val.config && val.config.prizes) ? val.config.prizes : {};
        const endDate = val.config ? val.config.endDate : null;
        const podiumEl = document.getElementById('podium-container');
        const tableEl = document.getElementById('table-body');
        if (!podiumEl || !tableEl) return;

        const top3 = [0, 1, 2].map(i => data[i] || { username: '---', level: 0 });
        podiumEl.innerHTML = `
            <div class="podium-card rank-2"><h1>#2</h1><div>${top3[1].username}</div><div class="lvl-badge">LVL ${top3[1].level}</div><div class="text-neon">${prizes[2] || '-'}</div></div>
            <div class="podium-card rank-1"><img src="images/logo.png" style="width:50px; margin-bottom:10px;"><h1 class="text-neon">#1</h1><div>${top3[0].username}</div><div class="lvl-badge">LVL ${top3[0].level}</div><div class="text-neon">${prizes[1] || '-'}</div></div>
            <div class="podium-card rank-3"><h1>#3</h1><div>${top3[2].username}</div><div class="lvl-badge">LVL ${top3[2].level}</div><div class="text-neon">${prizes[3] || '-'}</div></div>`;

        tableEl.innerHTML = data.slice(3).map((u, i) => `
            <tr><td class="text-neon">#${i+4}</td><td>${u.username}</td><td><span class="lvl-badge">LVL ${u.level}</span></td><td>${u.joined}</td><td style="color:var(--neon-yellow)">-</td></tr>
        `).join('');
        if(endDate) startCountdown(endDate);
    });
}

function startCountdown(endStr) {
    const el = document.getElementById('countdown');
    if (!el) return;
    const end = new Date(endStr).getTime();
    if(window.tInt) clearInterval(window.tInt);
    window.tInt = setInterval(() => {
        const diff = end - new Date().getTime();
        if (diff < 0) { el.innerText = "SEASON ENDED"; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerText = `${d}d ${h}h ${m}m ${s}s`;
    }, 1000);
}

function loadAdminSettings() {
    console.log("Admin Dashboard Loaded");
}
function saveTimer() {
    const date = document.getElementById('end-date').value;
    if(date) db.ref('config/endDate').set(date).then(() => alert('Timer Saved'));
}
function savePrizes() {
    const prizes = {
        1: document.getElementById('prize-1').value,
        2: document.getElementById('prize-2').value,
        3: document.getElementById('prize-3').value,
        4: document.getElementById('prize-4').value,
        5: document.getElementById('prize-5').value,
        rest: document.getElementById('prize-rest').value
    };
    db.ref('config/prizes').set(prizes).then(() => alert('Prizes Saved'));
}
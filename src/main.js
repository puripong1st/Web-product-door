import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

// ดึงตัวแปรสภาพแวดล้อม (.env) ผ่าน Vite
const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// ตั้งค่า Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rootRef = ref(db, 'hardwareProject');

let products = [];
let taskData = { web: [], board: [], document: [] };
let editingId = null;
let imageFetchController = null;

// ตารางผูกความสัมพันธ์ของสิทธิ์สมาชิกโปรเจกต์โดยดึงจาก .env
const TEAM_REGISTRY = {
    [import.meta.env.VITE_PIN_FILM || "1111"]: { name: "ฟิล์ม", role: "web", label: "สายงานระบบเว็บ" },
    [import.meta.env.VITE_PIN_HENG || "2222"]: { name: "เฮง", role: "board", label: "สายงานฮาร์ดแวร์บอร์ด" },
    [import.meta.env.VITE_PIN_ICE || "3333"]: { name: "ไอซ์", role: "document", label: "สายงานเล่มรายงาน" },
    [import.meta.env.VITE_PIN_PURIPONG || "2548"]: { name: "ภูริพงศ์", role: "admin", label: "ผู้ดูแลระบบกลาง" }
};

function verifyAuthority(pin, strictRole = null) {
    const user = TEAM_REGISTRY[pin];
    if (!user) return null;
    if (user.role === 'admin') return user;
    if (strictRole && user.role !== strictRole) return null;
    return user;
}

// ระบบเปลี่ยนหน้าจอ SPA Navigation
window.switchTab = function (tabName) {
    const tabs = ['dashboard', 'hardware', 'workspace', 'links'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        const view = document.getElementById(`view-${t}`);
        if (!btn || !view) return;
        if (t === tabName) {
            btn.className = `flex-1 md:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-2xs`;
            view.classList.replace('hidden', 'block');
        } else {
            btn.className = `flex-1 md:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-slate-600`;
            view.classList.replace('block', 'hidden');
        }
    });

    const budgetBar = document.getElementById('budget-dock-bar');
    if (budgetBar) {
        budgetBar.style.display = (tabName === 'workspace' || tabName === 'links') ? 'none' : 'block';
    }

    // โหลดข้อมูลคอมมิตและซิงค์ข้อมูลคู่มือเมื่อสวิตช์มาที่แท็บคลังลิงก์
    if (tabName === 'links') {
        syncLatestCommit();
        syncManualLastUpdated();
    }
}

window.showToast = function (message, isError = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `${isError ? 'bg-rose-600' : 'bg-slate-900'} text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 text-xs font-semibold toast-enter`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.remove('toast-enter'); toast.classList.add('toast-active'); }, 10);
    setTimeout(() => { toast.remove(); }, 3000);
};

window.copyAccount = function () {
    navigator.clipboard.writeText("1980737568").then(() => window.showToast("คัดลอกเลขบัญชีกองกลางรับโอนสำเร็จ"))
}

window.calculateSplit = function () {
    const rem = parseFloat(document.getElementById('totalRemaining').innerText.replace(/,/g, '')) || 0;
    let count = parseInt(document.getElementById('splitCount').value) || 1;
    if (count < 1) count = 1;
    document.getElementById('splitResult').innerText = (rem / count).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

window.toggleAdminPassword = function (btn) {
    const textEl = document.getElementById('admin-pass-text');
    if (!textEl) return;

    if (textEl.innerText === 'zazoza1234') {
        textEl.innerText = '••••••••';
        btn.innerText = 'แสดงรหัส';
        window.showToast("ซ่อนรหัสผ่านเรียบร้อย");
        return;
    }

    const pin = prompt("🔐 กรุณากรอกรหัส PIN ของทีมงานเพื่อดูรหัสผ่านเบื้องหลัง:");
    const user = verifyAuthority(pin);

    if (user) {
        textEl.innerText = 'zazoza1234';
        btn.innerText = 'ซ่อนรหัส';
        window.showToast(`ยืนยันสิทธิ์สำเร็จ ยินดีต้อนรับคุณ ${user.name}`);
    } else {
        window.showToast("รหัส PIN ไม่ถูกต้องหรือคุณไม่มีสิทธิ์เข้าถึง", true);
    }
}

function triggerDiscordWebhook(title, description, hexColor) {
    if (!DISCORD_WEBHOOK_URL) return;
    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: "Project Matrix Tracker",
            embeds: [{ title, description, color: hexColor, timestamp: new Date().toISOString() }]
        })
    }).catch(e => console.error(e));
}

// ซิงค์ข้อมูล Commit ล่าสุดจาก GitHub Repository
async function syncLatestCommit() {
    const el = document.getElementById('github-commit-info');
    if (!el) return;
    try {
        const res = await fetch('https://api.github.com/repos/puripong1st/SmartAccess-Project/commits?per_page=1');
        if (!res.ok) throw new Error('Repository Not Found or Rate Limited');
        const data = await res.json();
        if (data && data[0]) {
            const commitObj = data[0];
            const message = commitObj.commit.message;
            const author = commitObj.commit.author.name;
            const dateStr = commitObj.commit.author.date;
            const formattedDate = new Date(dateStr).toLocaleString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            el.innerHTML = `
                <div class="flex flex-col items-start sm:items-end text-left sm:text-right">
                    <span class="font-bold text-white line-clamp-1">${message}</span>
                    <span class="text-[9px] text-slate-400 mt-0.5">โดย <strong>${author}</strong> • ${formattedDate}</span>
                </div>
            `;
        } else {
            el.innerHTML = `<span class="text-slate-400">ไม่มีข้อมูล Commit</span>`;
        }
    } catch (e) {
        el.innerHTML = `<span class="text-rose-400 font-bold">เชื่อม GitHub ล้มเหลว (${e.message})</span>`;
    }
}

// ซิงค์ข้อมูลวันที่อัปเดตล่าสุดจากหน้าคู่มือระบบฉบับสมบูรณ์
async function syncManualLastUpdated() {
    const el = document.getElementById('manual-last-updated');
    if (!el) return;

    el.innerHTML = `<span class="animate-pulse text-[9px] text-slate-400 font-medium">⏳ กำลังซิงค์ข้อมูลอัปเดต...</span>`;

    try {
        // เรียก API route ของตัวเอง (same-origin, ไม่มี CORS)
        const res = await fetch('/api/sync-manual');
        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const data = await res.json();

        if (data.synced && data.lastUpdated) {
            const rawDate = data.lastUpdated; // "2026-06-01 13:54:00"
            const dateObj = new Date(rawDate.replace(' ', 'T') + '+07:00');

            const formattedDate = dateObj.toLocaleString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            // คำนวณความเก่าของอัปเดต
            const now = new Date();
            const diffMs = now - dateObj;
            const diffHours = diffMs / (1000 * 60 * 60);
            const diffDays = diffHours / 24;

            let freshnessColor = 'text-slate-500 bg-slate-100 border-slate-200';
            let freshnessIcon = '📄';
            let freshnessLabel = '';

            if (diffHours < 24) {
                freshnessColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                freshnessIcon = '🟢';
                freshnessLabel = 'อัปเดตล่าสุดวันนี้';
            } else if (diffDays < 7) {
                freshnessColor = 'text-amber-700 bg-amber-50 border-amber-200';
                freshnessIcon = '🟡';
                freshnessLabel = `${Math.floor(diffDays)} วันที่แล้ว`;
            } else {
                freshnessColor = 'text-slate-600 bg-slate-50 border-slate-200';
                freshnessIcon = '📄';
                freshnessLabel = `${Math.floor(diffDays)} วันที่แล้ว`;
            }

            el.innerHTML = `
                <div class="flex flex-col gap-1">
                    <span class="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border ${freshnessColor}">
                        ${freshnessIcon} ${freshnessLabel}
                    </span>
                    <span class="text-[9px] text-slate-400 font-medium">ซิงค์: ${formattedDate}</span>
                </div>
            `;
        } else {
            el.innerHTML = `<span class="text-[9px] text-slate-400 font-medium">⚠️ ${data.error || 'ไม่พบข้อมูลวันที่อัปเดต'}</span>`;
        }
    } catch (e) {
        el.innerHTML = `<span class="text-[9px] text-rose-500 font-bold">❌ ซิงค์ล้มเหลว (${e.message})</span>`;
    }
}

// คอยดักจับสัญญานข้อมูลจาก Cloud Database
onValue(rootRef, (snapshot) => {
    const val = snapshot.val() || {};

    // ประมวลผลกลุ่มวัสดุจัดซื้อ
    if (val.products) {
        products = Array.isArray(val.products) ? val.products : Object.values(val.products);
    } else {
        products = [];
    }

    // ประมวลผลกลุ่ม Tasks ติดตามความก้าวหน้า
    taskData = val.tasks || { web: [], board: [], document: [] };
    if (!taskData.web) taskData.web = [];
    if (!taskData.board) taskData.board = [];
    if (!taskData.document) taskData.document = [];

    calculateProgressMetrics();
    renderHardwareList();
    renderWorkspaceBoard();
    fetchImagesDynamically();
});

function calculateProgressMetrics() {
    const webTasks = taskData.web;
    const webDone = webTasks.filter(t => t.status === 'done').length;
    const webPct = webTasks.length ? Math.round((webDone / webTasks.length) * 100) : 0;
    document.getElementById('pct-web').innerText = `${webPct}%`;
    document.getElementById('bar-web').style.width = `${webPct}%`;

    const boardTasks = taskData.board;
    const boardDone = boardTasks.filter(t => t.status === 'done').length;
    const boardPct = boardTasks.length ? Math.round((boardDone / boardTasks.length) * 100) : 0;
    document.getElementById('pct-board').innerText = `${boardPct}%`;
    document.getElementById('bar-board').style.width = `${boardPct}%`;

    const docTasks = taskData.document;
    const docDone = docTasks.filter(t => t.status === 'done').length;
    const docPct = docTasks.length ? Math.round((docDone / docTasks.length) * 100) : 0;
    document.getElementById('pct-doc').innerText = `${docPct}%`;
    document.getElementById('bar-doc').style.width = `${docPct}%`;

    const buyDone = products.filter(p => p.status === 'bought').length;
    const buyPct = products.length ? Math.round((buyDone / products.length) * 100) : 0;
    document.getElementById('pct-buy').innerText = `${buyPct}%`;
    document.getElementById('bar-buy').style.width = `${buyPct}%`;
}

// ==========================================
// HARDWARE BASKET MANAGER
// ==========================================
window.saveProduct = function () {
    const name = document.getElementById('newName').value.trim();
    const price = parseFloat(document.getElementById('newPrice').value);
    const qty = parseInt(document.getElementById('newQty').value) || 1;
    const link = document.getElementById('newLink').value.trim() || "#";
    const image = document.getElementById('newImage').value.trim();

    if (!name || isNaN(price)) { window.showToast("กรุณากรอกข้อมูลพัสดุจำเป็นให้ครบถ้วน", true); return; }

    if (editingId) {
        const index = products.findIndex(p => p.id === editingId);
        if (index !== -1) {
            const currentStatus = products[index].status || 'pending';
            products[index] = { id: editingId, name, price, qty, link, status: currentStatus };
            if (image) products[index].fixedImage = image;
            else delete products[index].fixedImage;

            set(ref(db, 'hardwareProject/products'), products);
            triggerDiscordWebhook("📝 แก้ไขข้อมูลคุณสมบัติพัสดุอุปกรณ์", `รายการ: ${name}\nปรับปรุงรายละเอียดเสร็จสิ้น`, 16753920);
            window.showToast("อัปเดตข้อมูลอุปกรณ์พัสดุเรียบร้อย");
        }
        window.cancelEdit();
    } else {
        const newP = { id: Date.now(), name, price, qty, link, status: 'pending' };
        if (image) newP.fixedImage = image;
        let updatedList = [...products]; updatedList.push(newP);

        set(ref(db, 'hardwareProject/products'), updatedList);
        triggerDiscordWebhook("🛒 เพิ่มรายการวัสดุเข้าคลังพัสดุใหม่", `รายการ: ${name}\nประเมินงบ: ฿${(price * qty).toLocaleString()}`, 2664269);

        document.getElementById('newName').value = ''; document.getElementById('newPrice').value = ''; document.getElementById('newQty').value = '1'; document.getElementById('newLink').value = ''; document.getElementById('newImage').value = '';
        window.showToast("บันทึกข้อมูลอุปกรณ์พัสดุเรียบร้อย");
    }
};

window.editProduct = function (id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('newName').value = product.name;
    document.getElementById('newPrice').value = product.price;
    document.getElementById('newQty').value = product.qty || 1;
    document.getElementById('newLink').value = product.link === "#" ? "" : product.link;
    document.getElementById('newImage').value = product.fixedImage || "";

    editingId = id;
    document.getElementById('formTitle').innerText = "แก้ไขข้อมูลคุณสมบัติพัสดุอุปกรณ์";
    document.getElementById('saveBtn').innerText = "บันทึกการแก้ไข";
    document.getElementById('saveBtn').className = "bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all";
    document.getElementById('cancelEditBtn').classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelEdit = function () {
    editingId = null;
    document.getElementById('formTitle').innerText = "ลงทะเบียนจัดซื้ออุปกรณ์พัสดุ";
    document.getElementById('saveBtn').innerText = "บันทึกพัสดุ";
    document.getElementById('saveBtn').className = "bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all";
    document.getElementById('cancelEditBtn').classList.add('hidden');

    document.getElementById('newName').value = '';
    document.getElementById('newPrice').value = '';
    document.getElementById('newQty').value = '1';
    document.getElementById('newLink').value = '';
    document.getElementById('newImage').value = '';
};

window.updateProductStatus = function (id, nextStatus) {
    const pin = prompt("🔐 ป้อนรหัสสิทธิ์ของคุณ เพื่ออัปเดตสถานะจัดซื้อพัสดุวัตถุนี้:");
    const user = verifyAuthority(pin);
    if (!user) { window.showToast("รหัสตรวจสอบผิดพลาด การจัดสิทธิ์ล้มเหลว", true); return; }

    const updated = products.map(p => {
        if (p.id === id) p.status = nextStatus;
        return p;
    });
    set(ref(db, 'hardwareProject/products'), updated);
    triggerDiscordWebhook("🔄 ปรับปรุงสถานะสิทธิ์คลังจัดซื้อ", `ผู้ดำเนินการ: ${user.name}\nปรับเปลี่ยนสถานะจัดซื้อเรียบร้อย`, 16753920);
};

window.deleteProduct = function (id) {
    const pin = prompt("🚨 กรุณายืนยันรหัสพินส่วนกลาง (รหัสภูริพงศ์) เพื่อลบอุปกรณ์ถาวร:");
    const user = verifyAuthority(pin, 'admin');
    if (!user) { window.showToast("สิทธิ์การเข้าถึงเพื่อถอดถอนไอเทมถูกปฏิเสธ", true); return; }

    const updated = products.filter(p => p.id !== id);
    set(ref(db, 'hardwareProject/products'), updated);
    window.showToast("ลบพัสดุออกจากระบบเสร็จสิ้น");
};

function renderHardwareList() {
    const listEl = document.getElementById('productList');
    if (!listEl) return;
    listEl.innerHTML = '';

    let budget = 0; let bought = 0; let remaining = 0;

    products.forEach(p => {
        const qty = p.qty || 1; const sum = p.price * qty;
        budget += sum;
        if (p.status === 'bought') bought += sum;
        else if (p.status === 'pending') remaining += sum;

        let cardBg = 'bg-white border-slate-200';
        let overlay = 'hidden';
        let sliderPos = 'translate-x-0';
        let badgeHtml = '';

        if (p.status === 'bought') {
            cardBg = 'bg-slate-50 border-emerald-500/20 opacity-95';
            overlay = 'bg-emerald-500/5 border-emerald-500';
            sliderPos = 'translate-x-[200%]';
            badgeHtml = '<span class="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-sm border border-emerald-500 tracking-wider">ซื้อแล้ว</span>';
        } else if (p.status === 'hold') {
            cardBg = 'bg-slate-50 border-amber-500/20 opacity-90';
            overlay = 'bg-amber-500/5 border-amber-400';
            sliderPos = 'translate-x-[100%]';
            badgeHtml = '<span class="bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-sm border border-amber-400 tracking-wider">รอก่อนค่อยซื้อ</span>';
        } else {
            cardBg = 'bg-white border-slate-200';
            overlay = 'bg-rose-500/5 border-rose-400';
            sliderPos = 'translate-x-0';
            badgeHtml = '<span class="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-sm border border-rose-500 tracking-wider">ยังไม่ซื้อ</span>';
        }

        const card = document.createElement('div');
        card.className = `premium-card bg-white border rounded-2xl overflow-hidden flex flex-col justify-between relative group ${cardBg}`;
        card.innerHTML = `
            <div class="absolute top-2.5 right-2.5 z-20 flex gap-1.5 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button onclick="window.editProduct(${p.id})" class="w-6 h-6 border flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 bg-white shadow-2xs transition-colors" title="แก้ไขข้อมูล">✏️</button>
                <button onclick="window.deleteProduct(${p.id})" class="w-6 h-6 border flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 bg-white shadow-2xs transition-colors" title="ลบพัสดุ">✕</button>
            </div>
            
            <div class="h-36 bg-white relative flex items-center justify-center p-3 border-b border-slate-100 overflow-hidden">
                <div id="loading-${p.id}" class="absolute inset-0 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                    <svg class="w-4 h-4 animate-spin text-slate-300 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19"/></svg>
                    เรียกภาพหน้าร้าน
                </div>
                <img id="img-${p.id}" src="" alt="${p.name}" class="w-full h-full object-contain hidden transition-transform duration-700 group-hover:scale-105">
                
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none border-b-2 ${overlay}">
                    ${badgeHtml}
                </div>
            </div>

            <div class="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <h4 class="font-bold text-slate-900 text-xs leading-snug line-clamp-2 h-9 pr-4 group-hover:text-blue-600 transition-colors">${p.name}</h4>
                    <div class="mt-1 font-mono text-sm font-bold text-slate-900">฿${sum.toLocaleString()} <span class="text-[10px] text-slate-400 font-medium">/ ${qty} ชิ้น</span></div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-100">
                    <div class="relative grid grid-cols-3 bg-slate-100 p-0.5 rounded-xl text-center text-[10px] font-bold h-7 items-center cursor-pointer mb-2">
                        <div class="status-slider absolute top-0.5 bottom-0.5 left-0.5 w-[32%] bg-white rounded-md shadow-2xs ${sliderPos}"></div>
                        <div onclick="window.updateProductStatus(${p.id}, 'pending')" class="z-10 text-rose-500 py-1">ยัง</div>
                        <div onclick="window.updateProductStatus(${p.id}, 'hold')" class="z-10 text-amber-500 py-1">พัก</div>
                        <div onclick="window.updateProductStatus(${p.id}, 'bought')" class="z-10 text-emerald-600 py-1">คลัง</div>
                    </div>
                    <a href="${p.link}" target="_blank" class="w-full text-center text-[10px] font-bold text-slate-600 bg-slate-50 border py-1.5 rounded-xl block hover:bg-slate-100 transition-colors">หน้าร้านค้า</a>
                </div>
            </div>
        `;
        listEl.appendChild(card);
    });

    document.getElementById('totalBudget').innerText = budget.toLocaleString();
    document.getElementById('totalBought').innerText = bought.toLocaleString();
    document.getElementById('totalRemaining').innerText = remaining.toLocaleString();
    window.calculateSplit();
}

async function fetchImagesDynamically() {
    if (imageFetchController) imageFetchController.abort();
    imageFetchController = new AbortController();
    const { signal } = imageFetchController;

    if (products.length === 0) return;
    for (const p of products) {
        if (signal.aborted) return;
        const imgEl = document.getElementById(`img-${p.id}`);
        const loadEl = document.getElementById(`loading-${p.id}`);
        if (!imgEl || !loadEl) continue;

        if (p.fixedImage) {
            imgEl.src = p.fixedImage;
            imgEl.onload = () => { loadEl?.classList.add('hidden'); imgEl?.classList.remove('hidden'); };
            continue;
        }

        if (p.link && p.link !== "#") {
            try {
                const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(p.link)}`, { signal });
                const d = await res.json();
                imgEl.src = (d.status === 'success' && d.data.image?.url) ? d.data.image.url : `https://placehold.co/400x300/f1f5f9/64748b?text=No+Image`;
            } catch (e) {
                if (e.name === 'AbortError') return;
                imgEl.src = `https://placehold.co/400x300/fee2e2/ef4444?text=Error`;
            }
        } else {
            imgEl.src = `https://placehold.co/400x300/f1f5f9/64748b?text=No+Link`;
        }
        imgEl.onload = () => { loadEl?.classList.add('hidden'); imgEl?.classList.remove('hidden'); };
        await new Promise(r => setTimeout(r, 100));
    }
}

// ==========================================
// TASK MANAGEMENT WORKSPACE
// ==========================================
window.saveTask = function () {
    const cat = document.getElementById('taskCategory').value;
    const title = document.getElementById('taskTitle').value.trim();

    if (!title) { window.showToast("กรุณากรอกรายละเอียดเนื้องานที่ต้องการสั่งจ่ายด้วย", true); return; }

    const asigneeMap = { "web": "ฟิล์ม", "board": "เฮง", "document": "ไอซ์" };
    const newT = { id: 'tk-' + Date.now(), title, assignee: asigneeMap[cat], status: 'pending' };

    taskData[cat].push(newT);
    set(ref(db, 'hardwareProject/tasks'), taskData);

    triggerDiscordWebhook("📢 มอบหมายกระจายภาระงานใหม่เข้าระบบ", `**งาน:** ${title}\n**ผู้ดูแลสายตรง:** ${asigneeMap[cat]}`, 8345855);
    document.getElementById('taskTitle').value = '';
    window.showToast("ออกคำสั่งจ่ายงานกระจายเข้าบอร์ดสำเร็จ");
};

window.updateTaskStatus = function (category, taskId, nextStatus) {
    const pin = prompt(`🔐 ป้อนรหัส PIN ตนเอง เพื่อเซ็นรับรองสถานะงานชิ้นนี้:`);
    const user = verifyAuthority(pin, category);

    if (!user) {
        window.showToast("สิทธิ์ปฏิเสธการเข้าถึง รหัสไม่ถูกต้องหรือคุณไม่ได้คุมงานสายนี้", true);
        renderWorkspaceBoard();
        return;
    }

    const list = taskData[category] || [];
    const idx = list.findIndex(t => t.id === taskId);
    if (idx !== -1) {
        list[idx].status = nextStatus;
        set(ref(db, 'hardwareProject/tasks'), taskData);

        const labelState = nextStatus === 'done' ? 'สำเร็จเรียบร้อย' : nextStatus === 'doing' ? 'เริ่มดำเนินการแล้ว' : 'รอจัดทำ';
        triggerDiscordWebhook("🔄 เซ็นตรวจรับสถานะเนื้องานโปรเจกต์", `**ผู้ลงนาม:** ${user.name}\n**เนื้องาน:** ${list[idx].title}\n**ผลอัปเดต:** ${labelState}`, 3447003);
        window.showToast(`รับรองอัปเดตงานโดยคุณ: ${user.name}`);
    }
};

window.deleteTask = function (category, taskId) {
    const pin = prompt("🚨 ต้องยืนยันสิทธิ์ของใครคนใดคนหนึ่งในทีมด้วยรหัสพินเพื่อทำการลบภาระงานนี้:");
    const user = verifyAuthority(pin);

    if (!user) { window.showToast("รหัสรักษาความปลอดภัยไม่ถูกต้อง", true); return; }

    taskData[category] = (taskData[category] || []).filter(t => t.id !== taskId);
    set(ref(db, 'hardwareProject/tasks'), taskData);
    window.showToast("ถอนข้อกำหนดงานออกจากบอร์ดแล้ว");
};

function renderWorkspaceBoard() {
    const categories = ['web', 'board', 'document'];
    categories.forEach(cat => {
        const container = document.getElementById(`tasks-${cat}-list`);
        if (!container) return;
        container.innerHTML = '';
        const taskList = taskData[cat] || [];

        if (taskList.length === 0) {
            container.innerHTML = `<div class="text-center py-10 text-slate-400 text-[11px] font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center gap-1.5 shadow-3xs">
                <span class="text-lg">📭</span>
                <span>ยังไม่มีรายการงานสะสม</span>
            </div>`;
            return;
        }

        taskList.forEach(t => {
            const block = document.createElement('div');
            let cardStyle = 'bg-white border-slate-200/80 shadow-3xs';
            let badgeStyle = 'bg-slate-100 text-slate-600 border border-slate-200/60';
            let badgeText = '⏳ ต่อคิว';

            if (t.status === 'doing') {
                cardStyle = 'bg-gradient-to-br from-amber-50/20 to-white border-amber-300/80 shadow-2xs ring-1 ring-amber-400/10';
                badgeStyle = 'bg-amber-50 text-amber-700 border border-amber-200/50';
                badgeText = '⚡ ลุยงาน';
            } else if (t.status === 'done') {
                cardStyle = 'bg-gradient-to-br from-emerald-50/10 to-white border-emerald-200/60 opacity-90 shadow-3xs';
                badgeStyle = 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
                badgeText = '✅ สำเร็จ';
            }

            block.className = `premium-card rounded-2xl p-4 flex flex-col justify-between gap-4 border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${cardStyle}`;
            block.innerHTML = `
                <div>
                    <div class="flex justify-between items-start gap-2.5">
                        <h4 class="text-xs font-bold text-slate-800 leading-snug tracking-tight">${t.title}</h4>
                        <button onclick="window.deleteTask('${cat}', '${t.id}')" class="w-5 h-5 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50/80 transition-all font-medium" title="ลบงาน">✕</button>
                    </div>
                </div>
                <div class="flex justify-between items-center border-t border-slate-100/80 pt-3">
                    <span class="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg ${badgeStyle}">${badgeText}</span>
                    <div class="relative shrink-0">
                        <select onchange="window.updateTaskStatus('${cat}', '${t.id}', this.value)" class="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-[10px] font-bold text-slate-600 px-2.5 py-1 focus:outline-none transition-all cursor-pointer shadow-3xs hover:border-slate-300">
                            <option value="pending" ${t.status === 'pending' ? 'selected' : ''}>⏳ ต่อคิว</option>
                            <option value="doing" ${t.status === 'doing' ? 'selected' : ''}>⚡ ลุยงาน</option>
                            <option value="done" ${t.status === 'done' ? 'selected' : ''}>✅ สำเร็จ</option>
                        </select>
                    </div>
                </div>
            `;
            container.appendChild(block);
        });
    });
}

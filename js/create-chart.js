/**
 * ==========================================
 * 1. CẤU HÌNH & TIỆN ÍCH (CONFIG & UTILS)
 * ==========================================
 */
const GYM_CONFIG = {
    colors: {
        heatmap: [ '#fafdd69d', '#A2B38B', '#587850', '#E6BA95'], // light -> darker
        primary: '#E6BA95',
        accent: '#fafdd69d'
    },
    dayNames: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
};

const GymUtils = {
    q: (id) => document.getElementById(id),

    formatKg: (v) => (v == null || isNaN(v)) ? '--' : `${v.toFixed(1)} kg`,

    sign: (v) => v > 0 ? `+${v.toFixed(1)}` : `${v.toFixed(1)}`,

    parseDateField: (d) => {
        if (!d) return null;
        if (d instanceof firebase.firestore.Timestamp) return d.toDate();
        const t = new Date(d);
        return isNaN(t) ? null : t;
    },

    labelForKey: (k) => {
        const labels = {
            'chest': 'Ngực',
            'waist': 'Eo',
            'hips': 'Mông',
            'arm': 'Tay',
            'height': 'Chiều cao',
            'weight': 'Cân nặng'
        };
        return labels[k] || k;
    }
};

/**
 * ==========================================
 * 2. DỊCH VỤ DỮ LIỆU (DATA SERVICE)
 * Xử lý Auth và lấy dữ liệu từ Firebase
 * ==========================================
 */
const GymDataService = {
    // Lấy UID người dùng hiện tại (có timeout xử lý trễ)
    getUid: () => {
        return new Promise(resolve => {
            const user = firebase.auth().currentUser;
            if (user) return resolve(user.uid);

            const off = firebase.auth().onAuthStateChanged(u => {
                off();
                resolve(u ? u.uid : null);
            });
            // Timeout an toàn sau 3s nếu mạng chậm
            setTimeout(() => { off(); resolve(null); }, 3000);
        });
    },

    // Lấy dữ liệu của user cụ thể
    // Sử dụng lại hàm từ `read-write-data.js` nếu có: getBodyMeasurementsFromFirestore, getWorkoutsFromFirestore
    fetchUserProps: async (uid) => {
        try {
            // If helper functions from read-write-data.js are available, use them
            if (typeof getBodyMeasurementsFromFirestore === 'function' && typeof getWorkoutsFromFirestore === 'function') {
                const [measurements, workouts] = await Promise.all([
                    getBodyMeasurementsFromFirestore(uid),
                    getWorkoutsFromFirestore(uid)
                ]);

                // Normalize / sort: newest first by createdAt or date
                const sortByDateDesc = (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
                measurements.sort(sortByDateDesc);
                workouts.sort(sortByDateDesc);

                return { measurements, workouts };
            }

            // Fallback to direct Firestore queries if helpers not found
            const db = firebase.firestore();
            const [msnap, wsnap] = await Promise.all([
                db.collection('measurements').where('uid', '==', uid).orderBy('date', 'desc').get(),
                db.collection('workouts').where('uid', '==', uid).get()
            ]);
            return {
                measurements: msnap.docs.map(d => ({ id: d.id, ...d.data() })),
                workouts: wsnap.docs.map(d => ({ id: d.id, ...d.data() }))
            };
        } catch (err) {
            console.error('fetchUserProps error', err);
            return { measurements: [], workouts: [] };
        }
    },

    // Lấy dữ liệu chung (fallback khi không có user)
    fetchPublicProps: async () => {
        try {
            const db = firebase.firestore();
            const [msnap, wsnap] = await Promise.all([
                db.collection('measurements').orderBy('date', 'desc').limit(20).get(),
                db.collection('workouts').limit(200).get()
            ]);
            return {
                measurements: msnap.docs.map(d => ({ id: d.id, ...d.data() })),
                workouts: wsnap.docs.map(d => ({ id: d.id, ...d.data() }))
            };
        } catch (err) {
            console.error('fetchPublicProps error', err);
            return { measurements: [], workouts: [] };
        }
    }
};

/**
 * ==========================================
 * 3. HÀM VẼ GIAO DIỆN (UI RENDERING)
 * Các hàm này độc lập, chỉ cần truyền data vào là chạy
 * ==========================================
 */

// Render các ô thông tin (BMI, Cân nặng, Nhóm cơ yếu)
function renderInfoBoxes(measurements) {
    const bmiEl = GymUtils.q('bmi-value');
    const weightDiffEl = GymUtils.q('weight-diff-value');
    const weakEl = GymUtils.q('weak-muscles-value');

    if (!measurements || measurements.length === 0) {
        if (bmiEl) bmiEl.textContent = '--';
        if (weightDiffEl) weightDiffEl.textContent = '--';
        if (weakEl) weakEl.textContent = '--';
        return;
    }
    measurements = Array.isArray(measurements)
        ? measurements.slice().sort((a, b) => {
            const da = GymUtils.parseDateField(a.createdAt || a.date) || new Date(0);
            const db = GymUtils.parseDateField(b.createdAt || b.date) || new Date(0);
            return db.getTime() - da.getTime();
        })
        : [];

    const latest = measurements[0];
    const prev = measurements[measurements.length - 1] || null;

    // 1. Tính BMI
    let bmiText = '--';
    if (latest.height) {
        const h = Number(latest.height);
        const w = Number(latest.weight);
        if (h > 0 && !isNaN(w)) {
            const bmi = w / ((h / 100) ** 2);
            bmiText = bmi.toFixed(1);
        }
    }
    if (bmiEl) bmiEl.textContent = bmiText;

    // 2. So sánh cân nặng
    if (prev && latest.weight != null && prev.weight != null) {
        const diff = Number(latest.weight) - Number(prev.weight);
        if (weightDiffEl) weightDiffEl.textContent = `${GymUtils.sign(diff)} kg`;
    } else if (weightDiffEl) {
        weightDiffEl.textContent = '--';
    }

    // 3. Tìm nhóm cơ yếu/tiến bộ chậm nhất
    const ignored = new Set(['id', 'uid', 'weight', 'height', 'date', 'createdAt', 'updatedAt']);
    const muscleKeys = Object.keys(latest).filter(k => !ignored.has(k) && typeof latest[k] === 'number');
    let weak = '--';
    if (prev) {
        let best = null;
        muscleKeys.forEach(k => {
            const a = Number(latest[k]) || 0;
            const b = Number(prev[k]) || 0;
            const delta = a - b;
            if (best === null || delta < best.delta) best = { key: k, delta, latest: a };
        });
        if (best) weak = `${GymUtils.labelForKey(best.key)}${best.delta < 0 ? ' (giảm)' : ''}`;
    } else {
        let smallest = null;
        muscleKeys.forEach(k => {
            const a = Number(latest[k]) || 0;
            if (smallest === null || a < smallest.val) smallest = { key: k, val: a };
        });
        if (smallest) weak = GymUtils.labelForKey(smallest.key);
    }
    if (weakEl) weakEl.textContent = weak;
}

// Render biểu đồ tần suất tập luyện (Heatmap) - Fixed Layout
function renderDensityHeatmap(workouts) {
    const container = GymUtils.q('chart-density-heatmap');
    if (!container) return;
    container.innerHTML = '';

    // 1. Kiểm tra dữ liệu & Thư viện
    if (typeof Chart === 'undefined') {
        container.textContent = 'Lỗi: Thư viện Chart.js chưa được tải.';
        return;
    }

    // 2. Xử lý dữ liệu: Đếm số buổi tập
    const countsMap = new Map();
    if (workouts && workouts.length > 0) {
        workouts.forEach(w => {
            const d = GymUtils.parseDateField(w.date) || (w.date && new Date(w.date));
            if (d && !isNaN(d)) {
                const key = d.toISOString().slice(0, 10);
                countsMap.set(key, (countsMap.get(key) || 0) + 1);
            }
        });
    }


    // 3. Thiết lập khung thời gian: Từ 01/01 -> 31/12 (Full năm)
    const currentYear = new Date().getFullYear(); // Lấy năm hiện tại
    const today = new Date(); // Dùng để kiểm tra ngày tương lai (nếu muốn đổi màu khác)

    // Ngày bắt đầu: 01/01
    const startOfYear = new Date(currentYear, 0, 1);

    // Ngày kết thúc: 31/12
    const endOfYear = new Date(currentYear, 11, 31);

    // Lùi về Chủ Nhật gần nhất trước 01/01 để grid bắt đầu đẹp
    const startDate = new Date(startOfYear);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Lùi về CN (day 0)

    // Tìm max count (Giữ nguyên)
    let maxCount = 0;
    for (let c of countsMap.values()) if (c > maxCount) maxCount = c;
    if (maxCount === 0) maxCount = 1;

    // 4. Tạo Data Points
    const dataPoints = [];
    const backgroundColors = [];

    let iterDate = new Date(startDate);
    let weekIndex = 0;

    // THAY ĐỔI QUAN TRỌNG: Loop đến hết năm (endOfYear) thay vì hôm nay (today)
    while (iterDate <= endOfYear) {
        const dayOfWeek = iterDate.getDay();

        if (dayOfWeek === 0 && iterDate > startDate) {
            weekIndex++;
        }

        const dateKey = iterDate.toISOString().slice(0, 10);
        const isCurrentYear = iterDate.getFullYear() === currentYear;
        const count = isCurrentYear ? (countsMap.get(dateKey) || 0) : 0;

        // Kiểm tra xem ngày này có phải tương lai không?
        const isFuture = iterDate > today;

        // Xử lý màu sắc
        let color = GYM_CONFIG.colors.heatmap[0]; // Mặc định: Xám nhạt (empty)

        if (!isCurrentYear) {
            // Ngày bù đầu năm (năm cũ) -> Ẩn
            color = 'transparent';
        } else if (count > 0) {
            // Có tập luyện -> Tô màu theo level
            const ratio = count / maxCount;
            const colorIdx = Math.min(GYM_CONFIG.colors.heatmap.length - 1, Math.floor(ratio * (GYM_CONFIG.colors.heatmap.length - 1)) + 1);
            color = GYM_CONFIG.colors.heatmap[colorIdx];
        } else if (isFuture) {
            // (Tùy chọn) Ngày tương lai: Có thể làm mờ hơn hoặc giữ nguyên màu empty
            color = 'rgba(243, 244, 246, 0.2)'; // Nhạt hơn màu empty chuẩn một chút
        }

        dataPoints.push({
            x: weekIndex,
            y: dayOfWeek,
            v: count,
            d: dateKey
        });

        backgroundColors.push(color);

        // Next day
        iterDate.setDate(iterDate.getDate() + 1);
    }

    // 5. Tính toán kích thước Canvas để ô vuông đẹp
    // Mỗi ô vuông ~12px + gap. Tổng tuần ~53 tuần.
    const weeksTotal = weekIndex + 1;
    const boxSize = 16; // Kích thước điểm
    const minCanvasWidth = weeksTotal * 15 + 40; // 15px per column + padding

    // --- DOM Creation ---
    const header = document.createElement('div');
    header.style.marginBottom = '8px';
    header.style.fontWeight = '600';
    header.textContent = `Tần suất tập luyện (${currentYear})`;
    container.appendChild(header);

    const scrollWrap = document.createElement('div');
    scrollWrap.style.width = '100%';
    scrollWrap.style.overflowX = 'auto'; // Cho phép scroll ngang nếu màn hình nhỏ

    const canvasBox = document.createElement('div');
    // Chiều cao cố định: 7 ngày * khoảng 18px/dòng + padding ~ 150px
    canvasBox.style.height = '150px';
    canvasBox.style.width = `${minCanvasWidth}px`; // Set width cứng để tránh bị co lại (thưa)
    canvasBox.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvasBox.appendChild(canvas);
    scrollWrap.appendChild(canvasBox);
    container.appendChild(scrollWrap);

    // Legend
    const legend = document.createElement('div');
    legend.style.display = 'flex';
    legend.style.alignItems = 'center';
    legend.style.gap = '4px';
    legend.style.marginTop = '6px';
    legend.style.fontSize = '12px';
    legend.style.color = 'var(--tw-text-secondary, #9ca3af)';

    GYM_CONFIG.colors.heatmap.forEach(c => {
        const dot = document.createElement('span');
        dot.style.width = '10px'; dot.style.height = '10px';
        dot.style.backgroundColor = c; dot.style.borderRadius = '2px';
        dot.style.display = 'inline-block';
        legend.appendChild(dot);
    });
    container.appendChild(legend);

    // 6. Chart Configuration
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                data: dataPoints,
                backgroundColor: backgroundColors,
                borderWidth: 0, // Không viền để nhìn phẳng đẹp hơn
                pointRadius: boxSize / 2, // Radius = 1/2 width
                pointHoverRadius: (boxSize / 2) + 1,
                pointStyle: 'rectRounded' // Vuông bo góc
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Tắt animation để load nhanh và đỡ rối
            plugins: {
                legend: { display: false },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: function (ctx) {
                            const item = ctx.raw;
                            const dateStr = item.d.split('-').reverse().slice(0, 2).join('/'); // dd/mm
                            return `${dateStr}: ${item.v} bài tập`;
                        },
                        title: () => null // Ẩn title tooltip
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'top', // Đưa trục X lên trên (tháng) nếu cần, hoặc ẩn
                    min: -0.5,
                    max: weeksTotal - 0.5,
                    ticks: {
                        stepSize: 1,
                        display: false // Ẩn số tuần
                    },
                    grid: { display: false }
                },
                y: {
                    type: 'linear',
                    min: -0.5,
                    max: 6.5,
                    reverse: false, // Github: CN (0) ở trên cùng -> y=0 ở trên. Chartjs y=0 ở dưới. Cần config đúng.
                    // Để y=0 (CN) ở trên cùng trong ChartJS, ta cần set reverse: true hoặc mapping lại.
                    // Tuy nhiên Scatter chart trục Y dương hướng lên.
                    // Ta sẽ dùng thủ thuật: Mặc định Y=0 ở dưới. Ta muốn T2, T3, ... T7, CN (dưới cùng).
                    // Hoặc CN trên cùng. Để đơn giản, ta dùng callback ticks để map label.
                    ticks: {
                        stepSize: 1,
                        callback: (val) => GYM_CONFIG.dayNames[val], // Map 0 -> CN, 1 -> T2
                        font: { size: 10 },
                        padding: 5,
                        color: '#9ca3af'
                    },
                    grid: { display: false },
                    border: { display: false }
                }
            },
            layout: {
                padding: { left: 0, right: 0, top: 10, bottom: 0 }
            }
        }
    });
}

// Render phân tích số đo cơ thể (Đã chỉnh sửa: Chỉ dùng Chart.js)
function renderBodyAnalysis(measurements) {
    const container = GymUtils.q('chart-body-radar');
    if (!container) return;
    container.innerHTML = '';

    // Kiểm tra dữ liệu
    if (!measurements || measurements.length === 0) {
        const p = document.createElement('div');
        p.className = 'text-secondary text-center';
        p.textContent = 'Không có dữ liệu số đo.';
        container.appendChild(p);
        return;
    }

    // Lấy danh sách các key nhóm cơ (kiểu number)
    const ignored = new Set(['id', 'uid', 'userId', 'weight', 'height', 'date', 'createdAt', 'updatedAt']);
    const keySet = new Set();
    measurements.forEach(m => {
        Object.keys(m).forEach(k => {
            if (!ignored.has(k) && typeof m[k] === 'number') keySet.add(k);
        });
    });
    const muscleKeys = Array.from(keySet);
    if (muscleKeys.length === 0) {
        const p = document.createElement('div');
        p.className = 'text-secondary text-center';
        p.textContent = 'Không có trường nhóm cơ hợp lệ.';
        container.appendChild(p);
        return;
    }

    // Kiểm tra thư viện Chart.js
    if (typeof Chart === 'undefined') {
        const p = document.createElement('div');
        p.className = 'text-error text-center';
        p.textContent = 'Lỗi: Thư viện Chart.js chưa được tải.';
        container.appendChild(p);
        return;
    }

    // Chuẩn bị dữ liệu: Cũ nhất (Initial) và Mới nhất (Current)
    const latest = measurements[measurements.length - 1] || latest;
    const initial = measurements[0];

    const valsInitial = muscleKeys.map(k => Number(initial[k]) || 0);
    const valsCurrent = muscleKeys.map(k => Number(latest[k]) || 0);
    const labels = muscleKeys.map(k => GymUtils.labelForKey(k));

    // Tìm giá trị lớn nhất để config scale
    const maxVal = Math.max(...valsInitial.concat(valsCurrent), 1);

    // --- Xây dựng giao diện ---

    // 1. Tiêu đề
    const header = document.createElement('div');
    header.style.marginBottom = '8px';
    header.style.fontWeight = '600';
    header.style.width = '100%';
    header.style.textAlign = 'left';
    header.textContent = 'Phân tích tỷ lệ cơ thể';
    container.appendChild(header);

    // 2. Canvas Container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.position = 'relative';
    canvasContainer.style.height = '320px';
    canvasContainer.style.width = '100%';

    const canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);
    container.appendChild(canvasContainer);

    // 3. Helper chuyển màu Hex -> RGBa
    function hexToRgba(hex, alpha) {
        if (!hex) return `rgba(99,102,241,${alpha})`;
        const h = hex.replace('#', '');
        const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
        const bigint = parseInt(full, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r},${g},${b},${alpha})`;
    }

    // 4. Vẽ Chart
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Bắt đầu',
                    data: valsInitial,
                    backgroundColor: 'rgba(148,163,184,0.2)', // Xám nhạt
                    borderColor: 'rgba(148,163,184,0.8)',
                    pointBackgroundColor: 'rgba(148,163,184,1)',
                    borderWidth: 1.5,
                    pointRadius: 3,
                },
                {
                    label: 'Hiện tại',
                    data: valsCurrent,
                    backgroundColor: hexToRgba(GYM_CONFIG.colors.primary, 0.2), // Primary color
                    borderColor: GYM_CONFIG.colors.primary,
                    pointBackgroundColor: GYM_CONFIG.colors.primary,
                    borderWidth: 2,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    // angleLines: { color: 'rgba(255, 36, 36, 0.96)' },
                    grid: { color: '#A2B38B' },
                    suggestedMin: 0,
                    suggestedMax: maxVal * 1.1, // Thêm khoảng trống ở đỉnh
                    ticks: {
                        color: '#A2B38B',
                        backdropColor: 'transparent',
                        stepSize: Math.ceil(maxVal / 4) || 5,
                        font: { size: 10 }
                    },
                    pointLabels: {
                        font: { size: 12, family: 'sans-serif' },
                        color: '#FFF8D4'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 20,
                        font: { size: 12 },
                        color: '#FFF8D4'
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Setup chart tab switching (density <-> body analysis)
function setupChartTabs() {
    const dBtn = GymUtils.q('chart-tab-density-btn');
    const bBtn = GymUtils.q('chart-tab-body-btn');
    const dTab = GymUtils.q('chart-tab-density');
    const bTab = GymUtils.q('chart-tab-body');
    if (!dBtn || !bBtn || !dTab || !bTab) return;

    function setActive(isDensity) {
        dBtn.classList.toggle('tab-active', isDensity);
        dBtn.classList.toggle('tab-inactive', !isDensity);
        bBtn.classList.toggle('tab-active', !isDensity);
        bBtn.classList.toggle('tab-inactive', isDensity);
        dTab.classList.toggle('hidden', !isDensity);
        bTab.classList.toggle('hidden', isDensity);
    }

    // Initialize state from existing classes (fallback to density)
    const initialDensity = dBtn.classList.contains('tab-active') || dTab.classList.contains('chart-tab-active');
    setActive(Boolean(initialDensity));

    dBtn.addEventListener('click', () => setActive(true));
    bBtn.addEventListener('click', () => setActive(false));
}

/**
 * ==========================================
 * 4. LOGIC CHÍNH & KHỞI TẠO (MAIN)
 * Điều phối các hàm trên để chạy ứng dụng
 * ==========================================
 */
(function MainApp() {

    // Hàm gọi tất cả render
    function renderAllCharts(measurements, workouts) {
        renderInfoBoxes(measurements);
        renderDensityHeatmap(workouts);
        renderBodyAnalysis(measurements);
    }

    // Hàm khởi tạo chính
    async function init() {
        try {
            // init tab switching for charts
            try { setupChartTabs(); } catch (e) { /* ignore */ }

            const uid = await GymDataService.getUid();
            let data;

            if (uid) {
                // Có user: lấy data riêng
                data = await GymDataService.fetchUserProps(uid);
            } else {
                // Không user: lấy data mẫu/public
                console.log('Chưa đăng nhập, tải dữ liệu mẫu...');
                data = await GymDataService.fetchPublicProps();
            }

            renderAllCharts(data.measurements, data.workouts);

        } catch (err) {
            console.error('Lỗi khởi tạo biểu đồ:', err);
        }
    }

    // Lắng nghe sự kiện load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const tabTrackerBtn = document.getElementById('tab-tracker-btn');
    const tabPersonalBtn = document.getElementById('tab-personal-btn');
    const tabTrackerContent = document.getElementById('tab-tracker-content');
    const tabPersonalContent = document.getElementById('tab-personal-content');

    const frontBodyContainer = document.getElementById('front-body-container');
    const backBodyContainer = document.getElementById('back-body-container');
    const weeklyViewContainer = document.getElementById('weekly-view');
    // (MỚI) DOM element cho container các ngày
    const weeklyDaysContainer = document.getElementById('weekly-days-container');

    // Workout Log Modal
    const logModal = document.getElementById('log-modal');
    const modalMuscleName = document.getElementById('modal-muscle-name');
    const previousWeightDisplay = document.getElementById('previous-weight-display');
    const workoutDateInput = document.getElementById('workout-date');
    const workoutWeightInput = document.getElementById('workout-weight-input');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Workout History Table
    const historyTableBody = document.getElementById('history-table-body');
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const deleteSelectedWorkoutsBtn = document.getElementById('delete-selected-workouts-btn');
    const selectAllWorkoutsCheckbox = document.getElementById('select-all-workouts-checkbox');

    // Measurement Elements
    const addMeasurementBtn = document.getElementById('add-measurement-btn');
    const measurementModal = document.getElementById('measurement-modal');
    const measurementForm = document.getElementById('measurement-form');
    const saveMeasurementBtn = document.getElementById('save-measurement-btn');
    const cancelMeasurementBtn = document.getElementById('cancel-measurement-btn');
    const mDateInput = measurementModal.querySelector('#measurement-date-input');
    const mWeightInput = measurementModal.querySelector('#measurement-weight-input');
    const mChestInput = measurementModal.querySelector('#measurement-chest-input');
    const mWaistInput = measurementModal.querySelector('#measurement-waist-input');
    const mHipsInput = measurementModal.querySelector('#measurement-hips-input');
    const mArmInput = measurementModal.querySelector('#measurement-arm-input');
    const measurementsTableBody = document.getElementById('measurements-table-body');
    const deleteSelectedMeasurementsBtn = document.getElementById('delete-selected-measurements-btn');
    const selectAllMeasurementsCheckbox = document.getElementById('select-all-measurements-checkbox');

    // (MỚI) DOM element cho pop-up (đã chuyển vào trong weekly-view)
    const dayDetailPopup = document.getElementById('day-detail-popup');
    const popupDateTitle = document.getElementById('popup-date-title');
    const popupMuscleList = document.getElementById('popup-muscle-list');
    const popupNoWorkout = document.getElementById('popup-no-workout');

    // Icons
    const muscleIcons = {
        "Ngực": "/images/choose/chest.png",
        "Vai": "/images/choose/shoulder.png",
        "Bụng": "/images/choose/abs.png",
        "Tay trước": "/images/choose/biceps.png",
        "Lưng": "/images/choose/back.png",
        "Tay sau": "/images/choose/triceps.png",
        "Mông": "/images/choose/glutes.png",
        "Đùi trước": "/images/choose/quads.png",
        "Đùi sau": "/images/choose/hamstrings.png",
        "Bắp chân": "/images/choose/calves.png"
    };

    // --- State Management ---
    let workouts = JSON.parse(localStorage.getItem('gymWorkouts')) || [];
    let bodyMeasurements = JSON.parse(localStorage.getItem('gymBodyMeasurements')) || [];
    

    const frontMuscles = ["Ngực", "Vai", "Bụng", "Tay trước", "Đùi trước"];
    const backMuscles = ["Lưng", "Tay sau", "Mông", "Đùi sau", "Bắp chân"];
    const allMuscles = [...frontMuscles, ...backMuscles];

    // --- Functions ---

    const saveWorkouts = () => localStorage.setItem('gymWorkouts', JSON.stringify(workouts));
    const saveBodyMeasurements = () => localStorage.setItem('gymBodyMeasurements', JSON.stringify(bodyMeasurements));

    const formatDate = (dateString) => {
        if (!dateString) return '--/--/----';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // --- Theme Functions ---
    const applyTheme = (theme) => { /* ... (giữ nguyên) ... */
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    };
    const toggleTheme = () => { /* ... (giữ nguyên) ... */
        const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // --- Modal Functions ---
    const openModal = (element, modal) => modal.classList.add('open');
    const closeModal = (element, modal) => modal.classList.remove('open');

const getLatestMeasurement = () => {
    if (!bodyMeasurements || bodyMeasurements.length === 0) return null; // Kiểm tra nếu không có dữ liệu
    const sortedMeasurements = bodyMeasurements.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedMeasurements[0]; // Trả về số đo gần nhất
};
addMeasurementBtn.addEventListener('click', () => {
    measurementForm.reset(); // Xóa dữ liệu cũ trong form
    mDateInput.value = new Date().toISOString().split('T')[0]; // Điền ngày hiện tại

    const latestMeasurement = getLatestMeasurement(); // Lấy số đo lần trước
    console.log("Latest measurement:", latestMeasurement);
    if (latestMeasurement) {
        mWeightInput.value = latestMeasurement.weight || ''; // Điền cân nặng
        mChestInput.value = latestMeasurement.chest || ''; // Điền vòng ngực
        mWaistInput.value = latestMeasurement.waist || ''; // Điền vòng eo
        mHipsInput.value = latestMeasurement.hips || ''; // Điền vòng mông
        mArmInput.value = latestMeasurement.arm || ''; // Điền vòng tay
        console.log(mWeightInput.value, mChestInput.value, mWaistInput.value, mHipsInput.value, mArmInput.value);
    } else {
        console.log('No previous measurement found.');
    }

    openModal(null, measurementModal); // Mở modal
    setTimeout(() => {
        mWeightInput.focus(); // Tự động focus vào input cân nặng
        mWeightInput.select(); // Chọn toàn bộ nội dung trong input
    }, 100);
});
    /**
     * (CẬP NHẬT) Thêm auto-focus
     */
    const openLogModal = (muscleName) => {
        modalMuscleName.textContent = muscleName;
        logModal.dataset.muscle = muscleName;

        const latestWeight = getLatestWeight(muscleName); // Lấy số kg lần gần nhất
        previousWeightDisplay.textContent = `${latestWeight} kg`; // Hiển thị số kg lần trước
        workoutDateInput.value = new Date().toISOString().split('T')[0];
        workoutWeightInput.value = ''; // Reset giá trị input
        openModal(null, logModal);

        setTimeout(() => {
            workoutWeightInput.focus();
            workoutWeightInput.select();
        }, 100);
    };

    const getLatestWeight = (muscleName) => {
        const muscleWorkouts = workouts
            .filter(w => w.muscle === muscleName && w.weight) // Lọc các buổi tập có nhóm cơ và số kg
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp theo ngày giảm dần
        console.log("last muscle workouts:", muscleWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date)));
        return (muscleWorkouts.length > 0) ? muscleWorkouts[0].weight : 0; // Lấy số kg lần gần nhất
    };

    const getProgressIcon = (muscleName) => {
        const muscleWorkouts = workouts
            .filter(w => w.muscle === muscleName && w.weight && w.rep)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (muscleWorkouts.length < 2) return { icon: "line_end", color: "red" };

        const latestWorkout = muscleWorkouts[0];
        const previousWorkout = muscleWorkouts[1];

        if (latestWorkout.weight > previousWorkout.weight) {
            return { icon: "arrow_circle_right", color: "var(--text-primary)" };
        } else if (latestWorkout.weight === previousWorkout.weight) {
            if (latestWorkout.rep < previousWorkout.rep) {
                return { icon: "flag", color: "var(--md-sys-color-success)" };
            }
        }
        return { icon: "line_end", color: "var(--danger-color)" };
    };

    /**
     * (CẬP NHẬT) Render vào #weekly-days-container
     */
    const renderWeeklyView = () => {
        if (!weeklyDaysContainer) return; // Kiểm tra nếu container không tồn tại, thoát hàm

        weeklyDaysContainer.innerHTML = ''; // Xóa nội dung hiện tại của container

        const today = new Date(); // Lấy ngày hiện tại
        const dayOfWeek = today.getDay(); // Lấy chỉ số ngày trong tuần (0 = CN, 1 = T2, ..., 6 = T7)

        // Tính ngày bắt đầu của tuần (luôn là Thứ Hai)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Nếu là CN (dayOfWeek === 0), lùi về T2 của tuần trước
        console.log("Start of week:", startOfWeek);
        startOfWeek.setHours(0, 0, 0, 0); // Đặt giờ của ngày bắt đầu về 00:00:00

        const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']; // Tên các ngày trong tuần

        for (let i = 0; i < 7; i++) { // Lặp qua 7 ngày trong tuần
            const currentDay = new Date(startOfWeek); // Tạo một bản sao của ngày bắt đầu
            currentDay.setDate(startOfWeek.getDate() + i); // Cộng thêm số ngày để tính ngày hiện tại trong tuần

            const dateString = new Date(currentDay.getTime() + (7 * 60 * 60 * 1000)) // Bù múi giờ +7
                .toISOString()
                .split('T')[0]; // Chuyển ngày thành chuỗi định dạng YYYY-MM-DD
            const hasWorkout = workouts.some(w => w.date === dateString); // Kiểm tra xem ngày này có buổi tập nào không
            const isToday = dateString === new Date().toISOString().split('T')[0]; // Kiểm tra xem ngày này có phải ngày hiện tại không

            // Tạo phần tử hiển thị cho ngày
            const dayElement = document.createElement('div');
            dayElement.className = 'flex flex-col items-center gap-2 cursor-pointer weekly-day-btn'; // Thêm class cho phần tử
            dayElement.dataset.date = dateString; // Gán ngày vào dataset
            dayElement.dataset.dayName = dayNames[i]; // Gán tên ngày vào dataset

            // Nội dung HTML của ngày
            dayElement.innerHTML = `
            <span class="text-sm font-medium" style="color: ${isToday ? 'var(--accent-color)' : 'var(--text-secondary)'};">${dayNames[i]}</span>
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full" style="background-color: ${hasWorkout ? 'var(--highlight-color)' : 'var(--bg-secondary)'}; ${isToday ? 'outline: 2px solid var(--accent-color);' : 'border: 2px solid var(--border-color)'}"></div>
        `;

            weeklyDaysContainer.appendChild(dayElement); // Thêm phần tử vào container
        }
    };


    const updateMuscleMap = () => {
        const muscleCounts = {};
        allMuscles.forEach(m => muscleCounts[m] = 0);

        workouts.forEach(w => {
            if (w.muscle in muscleCounts) {
                muscleCounts[w.muscle]++;
            }
        });

        allMuscles.forEach(muscleName => {
            const circleEl = document.querySelector(`.muscle-circle[data-muscle="${muscleName}"]`);
            if (!circleEl) return;

            const count = muscleCounts[muscleName];
            const latestWeight = getLatestWeight(muscleName); // Lấy số kg lần gần nhất
            circleEl.querySelector('.muscle-count').textContent = `${count} lần`;
            circleEl.querySelector('.muscle-prev-weight').textContent = ` ${latestWeight} kg / `; // Hiển thị đúng số kg lần gần nhất
            circleEl.classList.toggle('trained', count > 0);

            // Bổ sung logic hiển thị icon mức độ phát triển
            const progressIcon = getProgressIcon(muscleName); // Lấy icon và màu dựa trên logic
            const progressElement = document.createElement('span');
            progressElement.className = "material-symbols-outlined";
            progressElement.style.color = progressIcon.color; // Áp dụng màu cho icon
            progressElement.textContent = progressIcon.icon; // Hiển thị icon
            circleEl.querySelector('.muscle-prev-weight').appendChild(progressElement); // Chèn icon vào phần hiển thị
        });
    };

    const createMuscleDashboard = () => {
        const createColumnContent = (title, muscles) => {
            const sortedMuscles = muscles.sort();
            const muscleCirclesHTML = sortedMuscles.map(muscle => `
            <div class="muscle-circle" data-muscle="${muscle}">
                <img src="${muscleIcons[muscle] || 'img-mc/choose/default.png'}" alt="${muscle}" class="muscle-icon w-10 h-10 object-contain">
                <span class="muscle-name-label">${muscle}</span>
                <span class="muscle-count">0 lần</span>
                <span class="muscle-prev-weight">Trước: 0 kg</span>
            </div>`).join('');

            return `
            <h3 class="text-lg font-bold text-center mb-4 text-secondary">${title}</h3>
            <div class="muscle-grid">
                ${muscleCirclesHTML}
            </div>`;
        };

        frontBodyContainer.innerHTML = createColumnContent('Thân trước', frontMuscles);
        backBodyContainer.innerHTML = createColumnContent('Thân sau', backMuscles);

        document.querySelectorAll('.muscle-circle').forEach(circle => {
            circle.addEventListener('click', () => {
                openLogModal(circle.dataset.muscle);
            });
        });
    };

    const updateFilterOptions = () => { /* ... (giữ nguyên) ... */
        filterSelect.innerHTML = '<option value="all">Tất cả nhóm cơ</option>';
        allMuscles.sort().forEach(muscle => {
            const option = document.createElement('option');
            option.value = muscle;
            option.textContent = muscle;
            filterSelect.appendChild(option);
        });
    };

    const renderHistoryTable = () => {
        historyTableBody.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        const filteredWorkouts = workouts
            .filter(w => w.muscle.toLowerCase().includes(searchTerm) && (filterValue === 'all' || w.muscle === filterValue))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredWorkouts.length === 0) {
            historyTableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-secondary">Chưa có dữ liệu.</td></tr>`;
            return;
        }
        filteredWorkouts.forEach(workout => {
            const row = document.createElement('tr');
            row.className = 'border-b border-color hover:bg-opacity-50 bg-secondary';
            row.innerHTML = `
            <td class="p-3 text-center"><input type="checkbox" class="data-table-checkbox workout-row-checkbox" data-id="${workout.id}"></td>
            <td class="p-3 font-medium text-primary">${workout.muscle}</td>
            <td class="p-3 text-secondary">${formatDate(workout.date)}</td>
            <td class="p-3 font-semibold text-primary">${workout.weight || 0} kg</td>
            <td class="p-3 font-semibold text-primary">${workout.rep || 0} rep</td> <!-- Hiển thị số rep -->
        `;
            historyTableBody.appendChild(row);
        });
        updateDeleteWorkoutsButtonVisibility();
    };

    // --- Measurement Functions ---
    const renderBodyMeasurementsTable = () => { /* ... (giữ nguyên) ... */
        measurementsTableBody.innerHTML = '';
        const sortedMeasurements = bodyMeasurements.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (sortedMeasurements.length === 0) {
            measurementsTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-secondary">Chưa có dữ liệu.</td></tr>`;
            return;
        }
        sortedMeasurements.forEach(m => {
            const row = document.createElement('tr');
            row.className = 'border-b border-color hover:bg-opacity-50 bg-secondary';
            row.innerHTML = `
                    <td class="p-3 text-center"><input type="checkbox" class="data-table-checkbox measurement-row-checkbox" data-id="${m.id}"></td>
                    <td class="p-3 font-medium text-primary">${formatDate(m.date)}</td>
                    <td class="p-3 text-primary">${m.weight || 0} kg</td>
                    <td class="p-3 text-primary">${m.chest || 0} cm</td>
                    <td class="p-3 text-primary">${m.waist || 0} cm</td>
                    <td class="p-3 text-primary">${m.hips || 0} cm</td>
                    <td class="p-3 text-primary">${m.arm || 0} cm</td>
                `;
            measurementsTableBody.appendChild(row);
        });
        updateDeleteMeasurementsButtonVisibility();
    };

    const updateDeleteMeasurementsButtonVisibility = () => { /* ... (giữ nguyên) ... */
        const selectedCount = document.querySelectorAll('.measurement-row-checkbox:checked').length;
        if (selectedCount > 0) {
            deleteSelectedMeasurementsBtn.classList.remove('hidden');
        } else {
            deleteSelectedMeasurementsBtn.classList.add('hidden');
            selectAllMeasurementsCheckbox.checked = false;
        }
    };

    const handleSaveMeasurement = (e) => { /* ... (giữ nguyên) ... */
        e.preventDefault();
        const newMeasurement = {
            id: Date.now(),
            date: mDateInput.value || new Date().toISOString().split('T')[0],
            weight: parseFloat(mWeightInput.value) || 0,
            chest: parseFloat(mChestInput.value) || 0,
            waist: parseFloat(mWaistInput.value) || 0,
            hips: parseFloat(mHipsInput.value) || 0,
            arm: parseFloat(mArmInput.value) || 0,
        };
        bodyMeasurements.push(newMeasurement);
        renderBodyMeasurementsTable();
        saveBodyMeasurements();
        closeModal(null, measurementModal);
        measurementForm.reset();
        mDateInput.value = new Date().toISOString().split('T')[0];
    };

    /**
     * (CẬP NHẬT) Logic định vị pop-up đã được sửa
     */
    const showDayDetailPopup = (dateString, dayName, targetElement) => {
        const workoutsForDay = workouts.filter(w => w.date === dateString);
        const musclesTrained = [...new Set(workoutsForDay.map(w => w.muscle))];

        popupDateTitle.textContent = `${dayName} (${formatDate(dateString)})`;

        if (musclesTrained.length === 0) {
            popupMuscleList.innerHTML = '';
            popupNoWorkout.classList.remove('hidden');
        } else {
            popupNoWorkout.classList.add('hidden');
            popupMuscleList.innerHTML = musclesTrained.map(muscle => `
                    <div class="popup-muscle-item">
                        <img src="${muscleIcons[muscle] || 'img-mc/choose/default.png'}" alt="${muscle}" class="muscle-icon w-5 h-5 object-contain">
                        <span class="text-primary">${muscle}</span>
                    </div>
                `).join('');
        }

        // Lấy kích thước
        const popupWidth = dayDetailPopup.offsetWidth;
        const popupHeight = dayDetailPopup.offsetHeight;

        // Lấy vị trí BÊN TRONG container (weekly-view)
        const targetOffsetTop = targetElement.offsetTop;
        const targetOffsetLeft = targetElement.offsetLeft;
        const targetWidth = targetElement.offsetWidth;
        const containerWidth = weeklyViewContainer.offsetWidth;

        let top = targetOffsetTop - popupHeight - 8; // 8px margin
        let left = targetOffsetLeft + (targetWidth / 2) - (popupWidth / 2);

        // Xử lý tràn lề
        if (left < 0) left = 0;
        if (left + popupWidth > containerWidth) {
            left = containerWidth - popupWidth;
        }

        // Áp dụng vị trí và hiển thị
        dayDetailPopup.style.top = `${top}px`;
        dayDetailPopup.style.left = `${left}px`;
        dayDetailPopup.classList.add('visible'); // (MỚI) Dùng class 'visible'
    };

    const hideDayDetailPopup = () => {
        dayDetailPopup.classList.remove('visible'); // (MỚI) Dùng class 'visible'
        dayDetailPopup.dataset.currentDate = '';
    }

    // --- Event Listeners ---

    themeToggleBtn.addEventListener('click', toggleTheme);

    // Tabs
    tabTrackerBtn.addEventListener('click', () => {
        tabTrackerBtn.classList.replace('tab-inactive', 'tab-active');
        tabPersonalBtn.classList.replace('tab-active', 'tab-inactive');
        tabTrackerContent.classList.add('tab-content-active');
        tabPersonalContent.classList.remove('tab-content-active');
        renderWeeklyView();
        updateMuscleMap();
        hideDayDetailPopup(); // Ẩn pop-up khi chuyển tab
    });
tabPersonalBtn.addEventListener('click', () => {
    tabPersonalBtn.classList.replace('tab-inactive', 'tab-active');
    tabTrackerBtn.classList.replace('tab-active', 'tab-inactive');
    tabPersonalContent.classList.add('tab-content-active');
    tabTrackerContent.classList.remove('tab-content-active');

    renderBodyMeasurementsTable(); // Gọi hàm render dữ liệu số đo
    renderHistoryTable(); // Gọi hàm render lịch sử tập luyện
});

    // Workout Modal
    cancelBtn.addEventListener('click', () => closeModal(null, logModal));
    confirmBtn.addEventListener('click', () => {
        const muscle = logModal.dataset.muscle;
        const selectedDate = workoutDateInput.value;
        const newWeight = parseFloat(workoutWeightInput.value) || 0;
        const newRep = parseInt(workoutRepInput.value) || 0; // Lấy số rep từ input

        if (muscle) {
            workouts.push({ id: Date.now(), muscle, date: selectedDate, weight: newWeight, rep: newRep }); // Thêm số rep vào dữ liệu
            saveWorkouts();
            renderWeeklyView();
            updateMuscleMap();
            if (tabPersonalContent.classList.contains('tab-content-active')) {
                renderHistoryTable();
            }
        }
        closeModal(null, logModal);
    });

    // Workout History
    searchInput.addEventListener('input', renderHistoryTable);
    filterSelect.addEventListener('change', renderHistoryTable);
    historyTableBody.addEventListener('click', e => {
        if (e.target.classList.contains('workout-row-checkbox')) {
            updateDeleteWorkoutsButtonVisibility();
        }
    });
    selectAllWorkoutsCheckbox.addEventListener('change', e => {
        document.querySelectorAll('.workout-row-checkbox').forEach(checkbox => checkbox.checked = e.target.checked);
        updateDeleteWorkoutsButtonVisibility();
    });
    deleteSelectedWorkoutsBtn.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.workout-row-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
        if (selectedIds.length > 0 && confirm(`Bạn có chắc muốn xóa ${selectedIds.length} mục tập luyện?`)) {
            workouts = workouts.filter(w => !selectedIds.includes(w.id));
            saveWorkouts();
            renderHistoryTable();
            renderWeeklyView();
            updateMuscleMap();
        }
    });

    // Measurement Modal
    addMeasurementBtn.addEventListener('click', () => {
        measurementForm.reset();
        mDateInput.value = new Date().toISOString().split('T')[0];
        openModal(null, measurementModal);
        // (MỚI) Cũng tự động focus cho modal số đo
        setTimeout(() => {
            mWeightInput.focus();
            mWeightInput.select();
        }, 100);
    });
    cancelMeasurementBtn.addEventListener('click', () => closeModal(null, measurementModal));
    measurementForm.addEventListener('submit', handleSaveMeasurement);

    // Measurement History
    measurementsTableBody.addEventListener('click', e => {
        if (e.target.classList.contains('measurement-row-checkbox')) {
            updateDeleteMeasurementsButtonVisibility();
        }
    });
    selectAllMeasurementsCheckbox.addEventListener('change', e => {
        document.querySelectorAll('.measurement-row-checkbox').forEach(checkbox => checkbox.checked = e.target.checked);
        updateDeleteMeasurementsButtonVisibility();
    });
    deleteSelectedMeasurementsBtn.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.measurement-row-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
        if (selectedIds.length > 0 && confirm(`Bạn có chắc muốn xóa ${selectedIds.length} số đo?`)) {
            bodyMeasurements = bodyMeasurements.filter(m => !selectedIds.includes(m.id));
            saveBodyMeasurements();
            renderBodyMeasurementsTable();
        }
    });

    /**
     * (CẬP NHẬT) Event Listeners cho Pop-up
     */
    // Lắng nghe trên container cha
    weeklyDaysContainer.addEventListener('click', (e) => {
        const dayBtn = e.target.closest('.weekly-day-btn');
        if (dayBtn) {
            // Kiểm tra xem pop-up đã hiển thị cho nút này chưa
            if (dayDetailPopup.dataset.currentDate === dayBtn.dataset.date && dayDetailPopup.classList.contains('visible')) {
                hideDayDetailPopup(); // Nếu rồi thì ẩn đi
            } else {
                const date = dayBtn.dataset.date;
                const dayName = dayBtn.dataset.dayName;
                showDayDetailPopup(date, dayName, dayBtn);
                dayDetailPopup.dataset.currentDate = date; // Lưu lại ngày đang hiển thị
            }
        }
    });

    document.addEventListener('click', (e) => {
        // Đóng pop-up nếu nhấn ra ngoài
        if (dayDetailPopup.classList.contains('visible') &&
            !dayDetailPopup.contains(e.target) &&
            !weeklyDaysContainer.contains(e.target)) { // (CẬP NHẬT) Check container
            hideDayDetailPopup();
        }
    });

    // --- Initialization ---
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    createMuscleDashboard();
    updateFilterOptions();
    renderWeeklyView();
    updateMuscleMap();

    const weightOptionsContainer = document.getElementById('workout-weight-options');
    const repOptionsContainer = document.getElementById('workout-rep-options');
    const workoutRepInput = document.getElementById('workout-rep-input');

    // Xử lý sự kiện khi chọn số kg
    weightOptionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('weight-option')) {
            const selectedWeight = e.target.dataset.weight;
            workoutWeightInput.value = selectedWeight; // Lưu giá trị vào input ẩn

            // Xóa class 'selected' khỏi tất cả các nút
            document.querySelectorAll('.weight-option').forEach(option => {
                option.classList.remove('selected');
            });

            // Thêm class 'selected' cho nút được chọn
            e.target.classList.add('selected');
        }
    });

    // Xử lý sự kiện khi chọn số rep
    repOptionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('rep-option')) {
            const selectedRep = e.target.dataset.rep;
            workoutRepInput.value = selectedRep; // Lưu giá trị vào input ẩn

            // Xóa class 'selected' khỏi tất cả các nút
            document.querySelectorAll('.rep-option').forEach(option => {
                option.classList.remove('selected');
            });

            // Thêm class 'selected' cho nút được chọn
            e.target.classList.add('selected');
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const tabTrackerBtn = document.getElementById('tab-tracker-btn');
    const tabPersonalBtn = document.getElementById('tab-personal-btn');
    const tabTrackerContent = document.getElementById('tab-tracker-content');
    const tabPersonalContent = document.getElementById('tab-personal-content');

    const workoutWeightInput = document.getElementById('workout-weight-input');
    const workoutRepInput = document.getElementById('workout-rep-input');
    const weightOptionsContainer = document.getElementById('workout-weight-options');
    const repOptionsContainer = document.getElementById('workout-rep-options');

    const newWeightInput = document.getElementById('new-weight-input'); // Input thêm số kg
    const newRepInput = document.getElementById('new-rep-input'); // Input thêm số rep
    const addWeightBtn = document.getElementById('add-weight-btn'); // Nút thêm số kg
    const addRepBtn = document.getElementById('add-rep-btn'); // Nút thêm số rep

    // --- State Management ---
    let weightConfig = JSON.parse(localStorage.getItem('weightConfig')) || [10, 15, 20, 25, 30, 35, 40, 45, 50];
    let repConfig = JSON.parse(localStorage.getItem('repConfig')) || [5, 10, 15];

    // --- Functions ---

    // Lưu cấu hình vào localStorage
    const saveWeightConfig = () => localStorage.setItem('weightConfig', JSON.stringify(weightConfig));
    const saveRepConfig = () => localStorage.setItem('repConfig', JSON.stringify(repConfig));

    // Render các nút số kg từ cấu hình
    const renderWeightOptions = () => {
        if (!weightOptionsContainer) return;
        weightOptionsContainer.innerHTML = '';
        weightConfig.forEach(weight => {
            const button = document.createElement('button');
            button.className = 'btn-secondary weight-option';
            button.textContent = `${weight} kg`;
            button.dataset.weight = weight;
            button.addEventListener('click', (e) => {
                workoutWeightInput.value = e.target.dataset.weight; // Lưu giá trị vào input ẩn
                document.querySelectorAll('.weight-option').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected'); // Đánh dấu nút được chọn
            });
            weightOptionsContainer.appendChild(button);
        });
    };

    // Render các nút số rep từ cấu hình
    const renderRepOptions = () => {
        if (!repOptionsContainer) return;
        repOptionsContainer.innerHTML = '';
        repConfig.forEach(rep => {
            const button = document.createElement('button');
            button.className = 'btn-secondary rep-option';
            button.textContent = `${rep} rep`;
            button.dataset.rep = rep;
            button.addEventListener('click', (e) => {
                workoutRepInput.value = e.target.dataset.rep; // Lưu giá trị vào input ẩn
                document.querySelectorAll('.rep-option').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected'); // Đánh dấu nút được chọn
            });
            repOptionsContainer.appendChild(button);
        });
    };

    // Thêm số kg mới
    const addNewWeight = () => {
        const newWeight = parseInt(newWeightInput.value);
        if (!isNaN(newWeight) && !weightConfig.includes(newWeight)) {
            weightConfig.push(newWeight);
            weightConfig.sort((a, b) => a - b); // Sắp xếp tăng dần
            saveWeightConfig(); // Lưu vào localStorage
            renderWeightConfig(); // Cập nhật giao diện cấu hình
            renderWeightOptions(); // Cập nhật các nút trong modal
            newWeightInput.value = ''; // Reset input
        }
    };

    // Thêm số rep mới
    const addNewRep = () => {
        const newRep = parseInt(newRepInput.value);
        if (!isNaN(newRep) && !repConfig.includes(newRep)) {
            repConfig.push(newRep);
            repConfig.sort((a, b) => a - b); // Sắp xếp tăng dần
            saveRepConfig(); // Lưu vào localStorage
            renderRepConfig(); // Cập nhật giao diện cấu hình
            renderRepOptions(); // Cập nhật các nút trong modal
            newRepInput.value = ''; // Reset input
        }
    };


    // Render các nút số kg trong "Cấu hình tập luyện"
    const renderWeightConfig = () => {
        const weightConfigContainer = document.getElementById('weight-config-container');
        if (!weightConfigContainer) return;

        weightConfigContainer.innerHTML = ''; // Xóa nội dung cũ
        weightConfig.forEach(weight => {
            const button = document.createElement('button');
            button.className = 'btn-secondary weight-config-item';
            button.textContent = `${weight} kg`;
            button.dataset.weight = weight;

            // Thêm sự kiện xóa nút
            button.addEventListener('click', () => {
                weightConfig = weightConfig.filter(w => w !== weight); // Xóa giá trị khỏi mảng
                saveWeightConfig(); // Lưu lại vào localStorage
                renderWeightConfig(); // Cập nhật giao diện
                renderWeightOptions(); // Cập nhật các nút trong modal
            });

            weightConfigContainer.appendChild(button);
        });
    };

    // Render các nút số rep trong "Cấu hình tập luyện"
    const renderRepConfig = () => {
        const repConfigContainer = document.getElementById('rep-config-container');
        if (!repConfigContainer) return;

        repConfigContainer.innerHTML = ''; // Xóa nội dung cũ
        repConfig.forEach(rep => {
            const button = document.createElement('button');
            button.className = 'btn-secondary rep-config-item';
            button.textContent = `${rep} rep`;
            button.dataset.rep = rep;

            // Thêm sự kiện xóa nút
            button.addEventListener('click', () => {
                repConfig = repConfig.filter(r => r !== rep); // Xóa giá trị khỏi mảng
                saveRepConfig(); // Lưu lại vào localStorage
                renderRepConfig(); // Cập nhật giao diện
                renderRepOptions(); // Cập nhật các nút trong modal
            });

            repConfigContainer.appendChild(button);
        });
    };



    // --- Initialization ---
    renderWeightOptions();
    renderRepOptions();
    renderWeightConfig(); // Hiển thị cấu hình số kg
    renderRepConfig(); // Hiển thị cấu hình số rep

    // --- Event Listeners ---
    addWeightBtn.addEventListener('click', addNewWeight); // Thêm số kg
    addRepBtn.addEventListener('click', addNewRep); // Thêm số rep

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('light', newTheme === 'light');
        localStorage.setItem('theme', newTheme);
    });

    tabTrackerBtn.addEventListener('click', () => {
        tabTrackerBtn.classList.replace('tab-inactive', 'tab-active');
        tabPersonalBtn.classList.replace('tab-active', 'tab-inactive');
        tabTrackerContent.classList.add('tab-content-active');
        tabPersonalContent.classList.remove('tab-content-active');
    });

    tabPersonalBtn.addEventListener('click', () => {
        tabPersonalBtn.classList.replace('tab-inactive', 'tab-active');
        tabTrackerBtn.classList.replace('tab-active', 'tab-inactive');
        tabPersonalContent.classList.add('tab-content-active');
        tabTrackerContent.classList.remove('tab-content-active');
    });
});
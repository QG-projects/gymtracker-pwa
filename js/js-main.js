document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. QUẢN LÝ TRẠNG THÁI & CẤU HÌNH (STATE & CONFIGURATION)
    // =================================================================

    // Dữ liệu chính của ứng dụng, được lưu vào localStorage
    // let workouts = JSON.parse(localStorage.getItem('gymWorkouts')) || [];
    // let bodyMeasurements = JSON.parse(localStorage.getItem('gymBodyMeasurements')) || [];
    // let weightConfig = JSON.parse(localStorage.getItem('weightConfig')) || [10, 15, 20, 25, 30, 35, 40, 45, 50];
    // let repConfig = JSON.parse(localStorage.getItem('repConfig')) || [5, 10, 15];

    // Các hằng số cấu hình
    const frontMuscles = ["Ngực", "Vai", "Bụng", "Tay trước", "Đùi trước"];
    const backMuscles = ["Lưng", "Tay sau", "Mông", "Đùi sau", "Bắp chân"];
    const allMuscles = [...frontMuscles, ...backMuscles];

    const muscleIcons = {
        "Ngực": "../../images/choose/chest.png",
        "Vai": "../../images/choose/shoulder.png",
        "Bụng": "../../images/choose/abs.png",
        "Tay trước": "../../images/choose/biceps.png",
        "Lưng": "../../images/choose/back.png",
        "Tay sau": "../../images/choose/triceps.png",
        "Mông": "../../images/choose/glutes.png",
        "Đùi trước": "../../images/choose/quads.png",
        "Đùi sau": "../../images/choose/hamstrings.png",
        "Bắp chân": "../../images/choose/calves.png"
    };


    // =================================================================
    // 2. TRUY XUẤT PHẦN TỬ DOM (DOM ELEMENTS)
    // =================================================================

    // --- Giao diện chính & Tabs ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const tabTrackerBtn = document.getElementById('tab-tracker-btn');
    const tabPersonalBtn = document.getElementById('tab-personal-btn');
    const tabTrackerContent = document.getElementById('tab-tracker-content');
    const tabPersonalContent = document.getElementById('tab-personal-content');

    // --- Tab "Tracker" ---
    const frontBodyContainer = document.getElementById('front-body-container');
    const backBodyContainer = document.getElementById('back-body-container');
    const weeklyViewContainer = document.getElementById('weekly-view');
    const weeklyDaysContainer = document.getElementById('weekly-days-container');
    const dayDetailPopup = document.getElementById('day-detail-popup');
    const popupDateTitle = document.getElementById('popup-date-title');
    const popupMuscleList = document.getElementById('popup-muscle-list');
    const popupNoWorkout = document.getElementById('popup-no-workout');

    // --- Modal Ghi Log Tập Luyện ---
    const logModal = document.getElementById('log-modal');
    const modalMuscleName = document.getElementById('modal-muscle-name');
    const previousWeightDisplay = document.getElementById('previous-weight-display');
    const workoutDateInput = document.getElementById('workout-date');
    const workoutWeightInput = document.getElementById('workout-weight-input');
    const workoutRepInput = document.getElementById('workout-rep-input');
    const weightOptionsContainer = document.getElementById('workout-weight-options');
    const repOptionsContainer = document.getElementById('workout-rep-options');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // --- Tab "Personal" - Lịch sử tập luyện ---
    const historyTableBody = document.getElementById('history-table-body');
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const deleteSelectedWorkoutsBtn = document.getElementById('delete-selected-workouts-btn');
    const selectAllWorkoutsCheckbox = document.getElementById('select-all-workouts-checkbox');

    // --- Tab "Personal" - Số đo cơ thể ---
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

    // --- Tab "Personal" - Cấu hình tập luyện ---
    const newWeightInput = document.getElementById('new-weight-input');
    const newRepInput = document.getElementById('new-rep-input');
    const addWeightBtn = document.getElementById('add-weight-btn');
    const addRepBtn = document.getElementById('add-rep-btn');
    const weightConfigContainer = document.getElementById('weight-config-container');
    const repConfigContainer = document.getElementById('rep-config-container');


    // =================================================================
    // 3. CÁC HÀM TIỆN ÍCH & LÕI (CORE & UTILITY FUNCTIONS)
    // =================================================================

    // --- Lưu dữ liệu vào Local Storage ---
    const saveWorkouts = () => localStorage.setItem('gymWorkouts', JSON.stringify(workouts));
    const saveBodyMeasurements = () => localStorage.setItem('gymBodyMeasurements', JSON.stringify(bodyMeasurements));
    const saveWeightConfig = () => localStorage.setItem('weightConfig', JSON.stringify(weightConfig));
    const saveRepConfig = () => localStorage.setItem('repConfig', JSON.stringify(repConfig));

    // --- Định dạng & Tiện ích khác ---
    const formatDate = (dateInput) => {
        if (!dateInput) return '--/--/----';

        let date;
        // Kiểm tra nếu dateInput là Timestamp từ Firestore
        if (dateInput.toDate) {
            date = dateInput.toDate(); // Chuyển Timestamp thành đối tượng Date
        } else if (typeof dateInput === 'string') {
            date = new Date(dateInput); // Nếu là chuỗi, chuyển thành Date
        } else {
            return '--/--/----'; // Trường hợp không hợp lệ
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const openModal = (modal) => modal.classList.add('open');
    const closeModal = (modal) => modal.classList.remove('open');


    // tiện ích: trả về khoảng tuần (T2..CN) dựa trên ngày tham chiếu
    const getWeekRange = (referenceDate = new Date()) => {
        const today = new Date(referenceDate);
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        endOfWeek.setHours(0, 0, 0, 0);

        const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const dateStrings = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            // giữ cùng cách format cũ (bù timezone giống trước)
            dateStrings.push(new Date(d.getTime() + (7 * 60 * 60 * 1000)).toISOString().split('T')[0]);
        }

        return { startOfWeek, endOfWeek, dayNames, dateStrings };
    };


    const normalizeToIsoDate = (d) => {
        if (!d) return null;
        if (d.toDate) d = d.toDate();
        if (typeof d === 'string') d = new Date(d);
        if (d instanceof Date && !isNaN(d)) return d.toISOString().split('T')[0];
        return null;
    };
    // =================================================================
    // 4. QUẢN LÝ GIAO DIỆN (THEME MANAGEMENT)
    // =================================================================

    // const applyTheme = (theme) => {
    //     document.documentElement.classList.toggle('light', theme === 'light');
    // };

    // const toggleTheme = () => {
    //     const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    //     const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    //     applyTheme(newTheme);
    //     localStorage.setItem('theme', newTheme);
    // };

    // themeToggleBtn.addEventListener('click', toggleTheme);

    const progressInfoBtn = document.getElementById('progress-info-btn');
    const progressInfoPopup = document.getElementById('progress-info-popup');
    const progressInfoCloseBtn = document.getElementById('progress-info-close');
     // --- progress info popup elements ---
   if (progressInfoBtn && progressInfoPopup) {
        progressInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            progressInfoPopup.classList.toggle('hidden');
            progressInfoPopup.setAttribute('aria-hidden', progressInfoPopup.classList.contains('hidden'));
        });
        progressInfoCloseBtn?.addEventListener('click', () => {
            progressInfoPopup.classList.add('hidden');
            progressInfoPopup.setAttribute('aria-hidden', 'true');
        });
        // click outside to close
        document.addEventListener('click', (e) => {
            if (!progressInfoPopup.classList.contains('hidden') && !progressInfoPopup.contains(e.target) && e.target !== progressInfoBtn) {
                progressInfoPopup.classList.add('hidden');
                progressInfoPopup.setAttribute('aria-hidden', 'true');
            }
        });
    }


    // =================================================================
    // 5. ĐIỀU HƯỚNG TAB (TAB NAVIGATION)
    // =================================================================

    tabTrackerBtn.addEventListener('click', () => {
        tabTrackerBtn.classList.replace('tab-inactive', 'tab-active');
        tabPersonalBtn.classList.replace('tab-active', 'tab-inactive');
        tabTrackerContent.classList.add('tab-content-active');
        tabPersonalContent.classList.remove('tab-content-active');
        renderWeeklyView();
        updateMuscleMap();
        hideDayDetailPopup();
    });

    tabPersonalBtn.addEventListener('click', () => {
        tabPersonalBtn.classList.replace('tab-inactive', 'tab-active');
        tabTrackerBtn.classList.replace('tab-active', 'tab-inactive');
        tabPersonalContent.classList.add('tab-content-active');
        tabTrackerContent.classList.remove('tab-content-active');
        renderBodyMeasurementsTable();
        renderHistoryTable();
        renderAllConfigs();
    });


    // =================================================================
    // 6. BẢNG ĐIỀU KHIỂN NHÓM CƠ (MUSCLE DASHBOARD)
    // =================================================================

    const getLatestWeight = (muscleName) => {
        const muscleWorkouts = workouts
            .filter(w => w.muscle === muscleName && w.weight)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        return (muscleWorkouts.length > 0) ? muscleWorkouts[0].weight : 0;
    };

    const getLatestRep = (muscleName) => {
        const muscleWorkouts = workouts
            .filter(w => w.muscle === muscleName && w.rep)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        return (muscleWorkouts.length > 0) ? muscleWorkouts[0].rep : 0;
    };

    const getProgressIcon = (muscleName) => {
        const muscleWorkouts = workouts
            .filter(w => w.muscle === muscleName && w.weight && w.rep)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (muscleWorkouts.length < 2) return { icon: "line_end", color: "var(--danger-color)" };

        const latestWorkout = muscleWorkouts[1];
        const previousWorkout = muscleWorkouts[0];

        // arrow_circle_right: khối lượng tạ tăng -> tiến bộ
        // flag: khối lượng tạ giữ nguyên nhưng số rep tăng -> đạt mục tiêu
        // line_end: các trường hợp còn lại
        if (latestWorkout.weight < previousWorkout.weight) {
            return { icon: "arrow_circle_right", color: "var(--text-primary)" };
        } else if (latestWorkout.weight === previousWorkout.weight) {
            if (latestWorkout.rep < previousWorkout.rep) {
                return { icon: "flag", color: "var(--md-sys-color-success)" };
            }
        }
        return { icon: "line_end", color: "var(--danger-color)" };
    };

    const updateMuscleMap = () => {
        const { startOfWeek, endOfWeek, dateStrings } = getWeekRange();

        const parseDate = (d) => {
            if (!d) return null;
            if (d.toDate) return d.toDate();
            if (typeof d === 'string') return new Date(d);
            if (d instanceof Date) return d;
            return null;
        };

        // Count only workouts that fall within the current week (based on dateStrings)
        const muscleCounts = {};
        allMuscles.forEach(m => muscleCounts[m] = 0);
        workouts.forEach(w => {
            if (!(w.muscle in muscleCounts)) return;
            const d = parseDate(w.date);
            if (!d) return;
            const isoDate = d.toISOString().split('T')[0];
            if (dateStrings.includes(isoDate)) {
                muscleCounts[w.muscle]++;
            }
        });

        allMuscles.forEach(muscleName => {
            const circleEl = document.querySelector(`.muscle-circle[data-muscle="${muscleName}"]`);
            if (!circleEl) return;

            const count = muscleCounts[muscleName];
            const latestWeight = getLatestWeight(muscleName);
            const progressIcon = getProgressIcon(muscleName);

            // kiểm tra bài tập trong tuần hiện tại cho nhóm cơ này
            const hasWorkoutThisWeek = workouts.some(w => {
                if (w.muscle !== muscleName) return false;
                const d = parseDate(w.date);
                if (!d) return false;
                return d >= startOfWeek && d < endOfWeek;
            });

            const prevWeightSpan = circleEl.querySelector('.muscle-prev-weight');
            prevWeightSpan.innerHTML = ` ${latestWeight} kg / <span class="material-symbols-outlined" style="color: ${progressIcon.color};">${progressIcon.icon}</span>`;
            circleEl.querySelector('.muscle-count').textContent = `${count} lần`;

            // chỉ toggle trained nếu có bài tập trong tuần hiện tại
            circleEl.classList.toggle('trained', hasWorkoutThisWeek);
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
                <h3 class="text-lg font-bold text-center mb-4 text-primary ">${title}</h3>
                <div class="muscle-grid">${muscleCirclesHTML}</div>`;
        };

        frontBodyContainer.innerHTML = createColumnContent('Thân trước', frontMuscles);
        backBodyContainer.innerHTML = createColumnContent('Thân sau', backMuscles);

        document.querySelectorAll('.muscle-circle').forEach(circle => {
            circle.addEventListener('click', () => openLogModal(circle.dataset.muscle));
        });
    };


    // =================================================================
    // 7. LỊCH TẬP TRONG TUẦN & POPUP CHI TIẾT (WEEKLY VIEW & POPUP)
    // =================================================================

    const renderWeeklyView = () => {
        if (!weeklyDaysContainer) return;
        weeklyDaysContainer.innerHTML = '';

        const { dayNames, dateStrings } = getWeekRange();

        for (let i = 0; i < 7; i++) {
            const dateString = dateStrings[i];
            const hasWorkout = workouts.some(w => normalizeToIsoDate(w.date) === dateString);
            const isToday = dateString === new Date().toISOString().split('T')[0];

            const dayElement = document.createElement('div');
            dayElement.className = 'flex flex-col items-center gap-2 cursor-pointer weekly-day-btn';
            dayElement.dataset.date = dateString;
            dayElement.dataset.dayName = dayNames[i];
            dayElement.innerHTML = `
                <span class="text-sm font-medium" style="color: ${isToday ? 'var(--accent-color)' : 'var(--text-secondary)'};">${dayNames[i]}</span>
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full" style="background-color: ${hasWorkout ? 'var(--highlight-color)' : 'var(--bg-secondary)'}; ${isToday ? 'outline: 3px dashed var(--border-color);' : 'border: 2px solid var(--accent-color)'}"></div>
            `;
            weeklyDaysContainer.appendChild(dayElement);
        }
    };

    const showDayDetailPopup = (dateString, dayName, targetElement) => {
        const workoutsForDay = workouts.filter(w => normalizeToIsoDate(w.date) === dateString);
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
                </div>`).join('');
        }

        const popupWidth = dayDetailPopup.offsetWidth;
        const popupHeight = dayDetailPopup.offsetHeight;
        const targetOffsetTop = targetElement.offsetTop;
        const targetOffsetLeft = targetElement.offsetLeft;
        const targetWidth = targetElement.offsetWidth;
        const containerWidth = weeklyViewContainer.offsetWidth;

        let top = targetOffsetTop - popupHeight - 8;
        let left = targetOffsetLeft + (targetWidth / 2) - (popupWidth / 2);

        if (left < 0) left = 0;
        if (left + popupWidth > containerWidth) left = containerWidth - popupWidth;

        dayDetailPopup.style.top = `${top}px`;
        dayDetailPopup.style.left = `${left}px`;
        dayDetailPopup.classList.add('visible');
    };

    const hideDayDetailPopup = () => {
        dayDetailPopup.classList.remove('visible');
        dayDetailPopup.dataset.currentDate = '';
    };

    weeklyDaysContainer.addEventListener('click', (e) => {
        const dayBtn = e.target.closest('.weekly-day-btn');
        if (dayBtn) {
            if (dayDetailPopup.dataset.currentDate === dayBtn.dataset.date && dayDetailPopup.classList.contains('visible')) {
                hideDayDetailPopup();
            } else {
                const date = dayBtn.dataset.date;
                const dayName = dayBtn.dataset.dayName;
                showDayDetailPopup(date, dayName, dayBtn);
                dayDetailPopup.dataset.currentDate = date;
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (dayDetailPopup.classList.contains('visible') && !dayDetailPopup.contains(e.target) && !weeklyDaysContainer.contains(e.target)) {
            hideDayDetailPopup();
        }
    });


    // =================================================================
    // 8. MODAL GHI LOG TẬP LUYỆN (WORKOUT LOG MODAL)
    // =================================================================

    const openLogModal = (muscleName) => {
        modalMuscleName.textContent = muscleName;
        logModal.dataset.muscle = muscleName;

        const latestWeight = getLatestWeight(muscleName);
        const latestRep = getLatestRep(muscleName);
        previousWeightDisplay.textContent = `${latestWeight} kg, ${latestRep} reps`;
        workoutDateInput.value = new Date().toISOString().split('T')[0];
        workoutWeightInput.value = '';
        workoutRepInput.value = '';

        // Xóa lựa chọn cũ
        document.querySelectorAll('.weight-option, .rep-option').forEach(btn => btn.classList.remove('selected'));

        openModal(logModal);
        setTimeout(() => workoutWeightInput.focus(), 100); // Focus vào input chính thay vì nút
    };

    const handleConfirmWorkout = async () => {
        const muscle = logModal.dataset.muscle;
        const selectedDate = workoutDateInput.value;
        const newWeight = parseFloat(workoutWeightInput.value) || 0;
        const newRep = parseInt(workoutRepInput.value) || 0;

        if (muscle) {
            try {
                const userId = auth.currentUser.uid; // Lấy ID người dùng đã đăng nhập
                const newWorkout = { muscle, date: selectedDate, weight: newWeight, rep: newRep };
                await addWorkoutToFirestore(userId, muscle, selectedDate, newWeight, newRep); // Lưu bài tập vào Firestore

                // Cập nhật biến toàn cục `workouts`
                window.workouts.push(newWorkout);

                // Cập nhật giao diện
                renderWeeklyView();
                updateMuscleMap();
                if (tabPersonalContent.classList.contains('tab-content-active')) {
                    renderHistoryTable();
                }
            } catch (error) {
                console.error('Error saving workout to Firestore:', error);
            }
        }
        closeModal(logModal);
    };

    confirmBtn.addEventListener('click', handleConfirmWorkout);
    cancelBtn.addEventListener('click', () => closeModal(logModal));

    weightOptionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('weight-option')) {
            workoutWeightInput.value = e.target.dataset.weight;
            document.querySelectorAll('.weight-option').forEach(option => option.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });

    repOptionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('rep-option')) {
            workoutRepInput.value = e.target.dataset.rep;
            document.querySelectorAll('.rep-option').forEach(option => option.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });


    // =================================================================
    // 9. LỊCH SỬ TẬP LUYỆN (WORKOUT HISTORY TABLE)
    // =================================================================

    const renderHistoryTable = async () => {
        if (!historyTableBody) return;
        historyTableBody.innerHTML = '';

        try {
            const userId = auth.currentUser.uid; // Lấy ID người dùng đã đăng nhập
            const workouts = await getWorkoutsFromFirestore(userId); // Lấy dữ liệu từ Firestore

            const searchTerm = searchInput.value.toLowerCase();
            const filterValue = filterSelect.value;
            const filteredWorkouts = workouts
                .filter(w => w.muscle.toLowerCase().includes(searchTerm) && (filterValue === 'all' || w.muscle === filterValue))
                .sort((a, b) => new Date(b.date.toDate()) - new Date(a.date.toDate())); // Chuyển timestamp thành Date để sắp xếp

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
                <td class="p-3 font-semibold text-primary">${workout.rep || 0} rep</td>
            `;
                historyTableBody.appendChild(row);
            });

            updateDeleteWorkoutsButtonVisibility();
        } catch (error) {
            console.error('Error rendering history table:', error);
        }
    };

    const updateDeleteWorkoutsButtonVisibility = () => {
        const selectedCount = document.querySelectorAll('.workout-row-checkbox:checked').length;
        deleteSelectedWorkoutsBtn.classList.toggle('hidden', selectedCount === 0);
        if (selectedCount === 0) selectAllWorkoutsCheckbox.checked = false;
    };

    const updateFilterOptions = () => {
        if (!filterSelect) return;
        filterSelect.innerHTML = '<option value="all">Tất cả nhóm cơ</option>';
        allMuscles.sort().forEach(muscle => {
            const option = document.createElement('option');
            option.value = muscle;
            option.textContent = muscle;
            filterSelect.appendChild(option);
        });
    };

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
    deleteSelectedWorkoutsBtn.addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.workout-row-checkbox:checked')).map(cb => cb.dataset.id);

        if (selectedIds.length > 0 && confirm(`Bạn có chắc muốn xóa ${selectedIds.length} mục tập luyện?`)) {
            try {
                await deleteWorkoutsFromFirestore(selectedIds); // Xóa dữ liệu từ Firestore

                // Tải lại dữ liệu từ Firestore
                const userId = auth.currentUser.uid;
                const updatedWorkouts = await getWorkoutsFromFirestore(userId);
                window.workouts = updatedWorkouts || []; // Cập nhật biến toàn cục `workouts`

                // Cập nhật giao diện
                renderHistoryTable();
                renderWeeklyView();
                updateMuscleMap();
            } catch (error) {
                console.error('Error deleting workouts:', error);
            }
        }
    });


    // =================================================================
    // 10. QUẢN LÝ SỐ ĐO CƠ THỂ (BODY MEASUREMENT)
    // =================================================================

    const getLatestMeasurement = async () => {
        try {
            const userId = auth.currentUser.uid; // Lấy ID người dùng đã đăng nhập
            const bodyMeasurements = await getBodyMeasurementsFromFirestore(userId); // Lấy dữ liệu từ Firestore

            if (!bodyMeasurements || bodyMeasurements.length === 0) return null;

            // Sắp xếp theo `createdAt` và trả về số đo mới nhất
            return bodyMeasurements.sort((a, b) => new Date(b.createdAt.toDate()) - new Date(a.createdAt.toDate()))[0];
        } catch (error) {
            console.error('Error fetching latest measurement:', error);
            return null;
        }
    };

    const renderBodyMeasurementsTable = async () => {
        if (!measurementsTableBody) return;
        measurementsTableBody.innerHTML = '';

        try {
            const userId = auth.currentUser.uid; // Lấy ID người dùng đã đăng nhập
            const bodyMeasurements = await getBodyMeasurementsFromFirestore(userId); // Lấy dữ liệu từ Firestore

            const sortedMeasurements = bodyMeasurements.sort((a, b) => new Date(b.createdAt.toDate()) - new Date(a.createdAt.toDate())); // Sắp xếp theo ngày

            if (sortedMeasurements.length === 0) {
                measurementsTableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-secondary">Chưa có dữ liệu.</td></tr>`;
                return;
            }

            sortedMeasurements.forEach(m => {
                const row = document.createElement('tr');
                row.className = 'border-b border-color hover:bg-opacity-50 bg-secondary';
                row.innerHTML = `
                <td class="p-3 text-center"><input type="checkbox" class="data-table-checkbox measurement-row-checkbox" data-id="${m.id}"></td>
                <td class="p-3 font-medium text-primary">${formatDate(m.createdAt)}</td>
                <td class="p-3 text-primary">${m.weight || 0} kg</td>
                <td class="p-3 text-primary">${m.chest || 0} cm</td>
                <td class="p-3 text-primary">${m.waist || 0} cm</td>
                <td class="p-3 text-primary">${m.hips || 0} cm</td>
                <td class="p-3 text-primary">${m.arm || 0} cm</td>
            `;
                measurementsTableBody.appendChild(row);
            });

            updateDeleteMeasurementsButtonVisibility();
        } catch (error) {
            console.error('Error rendering body measurements table:', error);
        }
    };

    const updateDeleteMeasurementsButtonVisibility = () => {
        const selectedCount = document.querySelectorAll('.measurement-row-checkbox:checked').length;
        deleteSelectedMeasurementsBtn.classList.toggle('hidden', selectedCount === 0);
        if (selectedCount === 0) selectAllMeasurementsCheckbox.checked = false;
    };

    const handleSaveMeasurement = async (e) => {
        e.preventDefault();
        const userId = auth.currentUser.uid; // Lấy ID người dùng đã đăng nhập
        const weight = parseFloat(mWeightInput.value) || 0;
        const chest = parseFloat(mChestInput.value) || 0;
        const waist = parseFloat(mWaistInput.value) || 0;
        const hips = parseFloat(mHipsInput.value) || 0;
        const arm = parseFloat(mArmInput.value) || 0;
        console.log('Saving measurement for user:', userId, weight, chest, waist, hips, arm);

        try {
            await addBodyMeasurementToFirestore(userId, weight, chest, waist, hips, arm); // Lưu vào Firestore
            const updatedMeasurements = await getBodyMeasurementsFromFirestore(userId);
            renderBodyMeasurementsTable(); // Cập nhật bảng hiển thị
            closeModal(measurementModal);
        } catch (error) {
            console.error('Error saving body measurement to Firestore:', error);
        }
    };
    addMeasurementBtn.addEventListener('click', async () => {
        measurementForm.reset();
        const today = new Date(); // Lấy ngày hôm nay
        const formattedDate = today.toISOString().split('T')[0]; // Định dạng ngày thành yyyy-mm-dd
        mDateInput.value = formattedDate; // Hiển thị ngày hôm nay lên trường ngày

        const latestMeasurement = await getLatestMeasurement(); // Gọi hàm bất đồng bộ
        if (latestMeasurement) {
            mWeightInput.value = latestMeasurement.weight || '';
            mChestInput.value = latestMeasurement.chest || '';
            mWaistInput.value = latestMeasurement.waist || '';
            mHipsInput.value = latestMeasurement.hips || '';
            mArmInput.value = latestMeasurement.arm || '';
        }
        openModal(measurementModal);
        setTimeout(() => {
            mWeightInput.focus();
            mWeightInput.select();
        }, 100);
    });

    cancelMeasurementBtn.addEventListener('click', () => closeModal(measurementModal));
    measurementForm.addEventListener('submit', handleSaveMeasurement);
    measurementsTableBody.addEventListener('click', e => {
        if (e.target.classList.contains('measurement-row-checkbox')) {
            updateDeleteMeasurementsButtonVisibility();
        }
    });
    selectAllMeasurementsCheckbox.addEventListener('change', e => {
        document.querySelectorAll('.measurement-row-checkbox').forEach(checkbox => checkbox.checked = e.target.checked);
        updateDeleteMeasurementsButtonVisibility();
    });
    deleteSelectedMeasurementsBtn.addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.measurement-row-checkbox:checked')).map(cb => cb.dataset.id);

        if (selectedIds.length > 0 && confirm(`Bạn có chắc muốn xóa ${selectedIds.length} số đo?`)) {
            try {
                await deleteBodyMeasurementsFromFirestore(selectedIds); // Xóa dữ liệu từ Firestore
                renderBodyMeasurementsTable(); // Cập nhật bảng hiển thị
            } catch (error) {
                console.error('Error deleting body measurements:', error);
            }
        }
    });


    // =================================================================
    // 11. CẤU HÌNH TẬP LUYỆN (WORKOUT CONFIGURATION)
    // =================================================================

    const renderOptions = (container, config, unit, className, dataAttr) => {
        if (!container) return;
        container.innerHTML = '';
        config.forEach(value => {
            const button = document.createElement('button');
            button.className = `btn-secondary ${className}`;
            button.textContent = `${value} ${unit}`;
            button.dataset[dataAttr] = value;
            container.appendChild(button);
        });
    };

    const renderConfigButtons = (container, config, unit, deleteCallback) => {
        if (!container) return;
        container.innerHTML = '';
        config.forEach(value => {
            const button = document.createElement('button');
            button.className = 'btn-secondary weight-config-item';
            button.textContent = `${value} ${unit}`;
            button.addEventListener('click', () => deleteCallback(value));
            container.appendChild(button);
        });
    };

    const renderAllConfigs = async () => {
        const userId = auth.currentUser.uid; // Lấy ID người dùng đã đăng nhập
        const configurations = await getConfigurationsFromFirestore(userId); // Lấy cấu hình từ Firestore

        weightConfig = configurations.weightConfig || [];
        repConfig = configurations.repConfig || [];

        renderOptions(weightOptionsContainer, weightConfig, 'kg', 'weight-option', 'weight');
        renderOptions(repOptionsContainer, repConfig, 'rep', 'rep-option', 'rep');
        renderConfigButtons(weightConfigContainer, weightConfig, 'kg', async (value) => {
            weightConfig = weightConfig.filter(w => w !== value);
            await updateConfigurationsInFirestore(userId, weightConfig, repConfig); // Cập nhật cấu hình trên Firestore
            renderAllConfigs();
        });
        renderConfigButtons(repConfigContainer, repConfig, 'rep', async (value) => {
            repConfig = repConfig.filter(r => r !== value);
            await updateConfigurationsInFirestore(userId, weightConfig, repConfig); // Cập nhật cấu hình trên Firestore
            renderAllConfigs();
        });
    };

    const addNewConfig = async (input, config, saveCallback) => {
        const newValue = parseInt(input.value);
        if (!isNaN(newValue) && !config.includes(newValue)) {
            config.push(newValue);
            config.sort((a, b) => a - b);

            const userId = auth.currentUser.uid; // Lấy ID người dùng đã đăng nhập
            await saveCallback(userId, weightConfig, repConfig); // Lưu cấu hình vào Firestore

            renderAllConfigs();
            input.value = '';
        }
    };

    addWeightBtn.addEventListener('click', () => addNewConfig(newWeightInput, weightConfig, updateConfigurationsInFirestore));
    addRepBtn.addEventListener('click', () => addNewConfig(newRepInput, repConfig, updateConfigurationsInFirestore));


    // =================================================================
    // 12. KHỞI TẠO ỨNG DỤNG (INITIALIZATION)
    // =================================================================

    const init = async () => {

        createMuscleDashboard();

        try {
            // Lắng nghe trạng thái đăng nhập từ Firebase Authentication
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const userId = user.uid; // Lấy ID người dùng đã đăng nhập
                    console.log('Lấy ID người dùng đã đăng nhập:', userId);

                    // Lấy dữ liệu từ Firestore
                    const workouts = await getWorkoutsFromFirestore(userId); // Lấy danh sách bài tập
                    const bodyMeasurements = await getBodyMeasurementsFromFirestore(userId); // Lấy số đo cơ thể
                    const configurations = await getConfigurationsFromFirestore(userId); // Lấy cấu hình tập luyện

                    // Gán dữ liệu từ Firestore
                    window.workouts = workouts || [];
                    window.bodyMeasurements = bodyMeasurements || [];
                    window.weightConfig = configurations.weightConfig || [];
                    window.repConfig = configurations.repConfig || [];

                    // Cập nhật giao diện
                    updateMuscleMap();
                    renderWeeklyView();
                    renderAllConfigs();
                } else {
                    console.warn('Người dùng chưa đăng nhập.');
                    // Chuyển hướng đến trang đăng nhập nếu cần
                    // window.location.href = '/index.html';
                }
            });
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    };

    init();

});
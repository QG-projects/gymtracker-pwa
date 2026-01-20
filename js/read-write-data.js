/* Thao tác liên quan đến bài tập */
const addWorkoutToFirestore = async (userId, muscle, date, weight, rep) => {
    try {
        await firestore.collection('workouts').add({
            userId,
            muscle,
            date: firebase.firestore.Timestamp.fromDate(new Date(date)),
            weight,
            rep,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Workout added successfully');
    } catch (error) {
        console.error('Error adding workout:', error);
    }
};

const getWorkoutsFromFirestore = async (userId) => {
    try {
        const snapshot = await firestore.collection('workouts').where('userId', '==', userId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching workouts:', error);
        return [];
    }
};

const deleteWorkoutsFromFirestore = async (workoutIds) => {
    try {
        const batch = firestore.batch();
        workoutIds.forEach(id => {
            const docRef = firestore.collection('workouts').doc(id);
            batch.delete(docRef);
        });
        await batch.commit();
        console.log('Workouts deleted successfully');
    } catch (error) {
        console.error('Error deleting workouts:', error);
    }
};

/* Thao tác liên quan đến đo lường cơ thể */
const addBodyMeasurementToFirestore = async (userId, height, weight, chest, waist, hips, arm) => {
    try {
        await firestore.collection('bodyMeasurements').add({
            userId,
            height,
            weight,
            chest,
            waist,
            hips,
            arm,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Body measurement added successfully');
    } catch (error) {
        console.error('Error adding body measurement:', error);
    }
};

const getBodyMeasurementsFromFirestore = async (userId) => {
    try {
        const snapshot = await firestore.collection('bodyMeasurements').where('userId', '==', userId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching body measurements:', error);
        return [];
    }
};

const deleteBodyMeasurementsFromFirestore = async (measurementIds) => {
    try {
        const batch = firestore.batch();
        measurementIds.forEach(id => {
            const docRef = firestore.collection('bodyMeasurements').doc(id);
            batch.delete(docRef);
        });
        await batch.commit();
        console.log('Body measurements deleted successfully');
    } catch (error) {
        console.error('Error deleting body measurements:', error);
    }
};
/* Thao tác liên quan đến cấu hình kg và số rep lặp lại */
const updateConfigurationsInFirestore = async (userId, weightConfig, repConfig) => {
    try {
        await firestore.collection('configurations').doc(userId).set({
            weightConfig,
            repConfig,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Configurations updated successfully');
    } catch (error) {
        console.error('Error updating configurations:', error);
    }
};
const getConfigurationsFromFirestore = async (userId) => {
    try {
        const doc = await firestore.collection('configurations').doc(userId).get();
        if (doc.exists) {
            return doc.data();
        } else {
            console.log('No configurations found for user:', userId);
            return { weightConfig: [], repConfig: [] };
        }
    } catch (error) {
        console.error('Error fetching configurations:', error);
        return { weightConfig: [], repConfig: [] };
    }
};

const deleteConfigurationsFromFirestore = async (userId) => {
    try {
        const docRef = firestore.collection('configurations').doc(userId);
        await docRef.delete();
        console.log('Configurations deleted successfully');
    } catch (error) {
        console.error('Error deleting configurations:', error);
    }
};








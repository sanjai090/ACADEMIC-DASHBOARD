const { db, collection, getDocs, deleteDoc, doc, query, where } = require('./server/database');

async function clearDB() {
    try {
        // Get all users except admin
        console.log("Fetching users...");
        const usersSnap = await getDocs(collection(db, 'users'));
        
        for (const userDoc of usersSnap.docs) {
            const data = userDoc.data();
            if (data.reg_no === 'admin') continue;

            const regNo = data.reg_no;

            // Delete results for this user
            console.log(`Deleting results for ${regNo}...`);
            const resultsQuery = query(collection(db, 'results'), where('reg_no', '==', regNo));
            const resultsSnap = await getDocs(resultsQuery);
            for (const resultDoc of resultsSnap.docs) {
                await deleteDoc(resultDoc.ref);
            }

            // Delete semester summaries for this user
            console.log(`Deleting semester summaries for ${regNo}...`);
            const summariesQuery = query(collection(db, 'semester_summaries'), where('reg_no', '==', regNo));
            const summariesSnap = await getDocs(summariesQuery);
            for (const summaryDoc of summariesSnap.docs) {
                await deleteDoc(summaryDoc.ref);
            }

            // Delete user
            console.log(`Deleting user ${regNo}...`);
            await deleteDoc(userDoc.ref);
        }

        console.log("Database cleared successfully (except admin).");
        process.exit(0);
    } catch (err) {
        console.error("Error clearing DB:", err);
        process.exit(1);
    }
}

// Run after a short delay to let Firebase init
setTimeout(clearDB, 2000);

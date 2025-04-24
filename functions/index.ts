import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// Scheduled function to reset user steps daily at midnight
export const resetUserStepsDaily = functions.pubsub
  .schedule("0 0 * * *") // Every day at 00:00 (midnight)
  .timeZone("Etc/UTC") // Use UTC timezone, adjust if needed
  .onRun(async (context) => {
    const usersSnapshot = await db.collection("users").get();

    const batch = db.batch();

    for (const userDoc of usersSnapshot.docs) {
      const stepsDocRef = userDoc.ref.collection("activity").doc("steps");
      const stepsDoc = await stepsDocRef.get();

      if (!stepsDoc.exists) {
        continue;
      }

      const stepsData = stepsDoc.data();
      const currentSteps = stepsData?.steps || 0;

      // Save current steps to stepsHistory subcollection with timestamp
      const historyRef = userDoc.ref.collection("activity").doc("stepsHistory").collection("history").doc();
      batch.set(historyRef, {
        steps: currentSteps,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Reset steps to 0
      batch.update(stepsDocRef, {
        steps: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    console.log("User steps reset and archived successfully.");

    return null;
  });

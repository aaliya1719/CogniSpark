import { NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import { askGemini } from "@/lib/vertexai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const userDoc = await userRef.get();

    let productivityScore = 0;
    let pomodorosToday = 0;

    if (userDoc.exists) {
      const data = userDoc.data();
      productivityScore = (data?.productivity_score || 0) + 10;
      pomodorosToday = (data?.pomodorosToday || 0) + 1;
    } else {
      productivityScore = 10;
      pomodorosToday = 1;
    }

    await userRef.set({
      productivity_score: productivityScore,
      pomodorosToday: pomodorosToday,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });

    let recap = null;
    if (pomodorosToday === 4) {
      recap = await generateDailyRecap(userId);
    }

    return NextResponse.json({ 
      success: true, 
      productivityScore, 
      pomodorosToday,
      recapTriggered: pomodorosToday === 4,
      recap 
    });
  } catch (error: unknown) {
    console.error("Pomodoro API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function generateDailyRecap(userId: string) {
  try {
    const prompt = "The user has completed 4 Pomodoro sessions today. Generate a short, motivational engineering-themed daily recap and a 'keep it up' message.";
    const system = "You are a motivational engineering coach. Keep it short, sharp, and focused on momentum.";
    
    const message = await askGemini(prompt, system);
    
    await db.collection(COLLECTIONS.RECAPS).doc(userId).set({
      content: message,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });

    return message;
  } catch (error) {
    console.error("Recap Generation Error:", error);
    return null;
  }
}

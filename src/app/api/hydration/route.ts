import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, COLLECTIONS } from "@/lib/firestore";

// GET -> return stored hydration (if any) for authenticated user
export async function GET() {
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const docRef = db.collection(COLLECTIONS.USERS).doc(userId);
  const snap = await docRef.get();
  const data = snap.exists ? snap.data() ?? {} : {};
  return NextResponse.json({ hydration: data.hydration ?? null });
}

// POST -> accept either { glasses: boolean[8] } to overwrite full state
// or { glassIndex: number, state: boolean } to update a single glass.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = session.user.id as string;
  const userRef = db.collection(COLLECTIONS.USERS).doc(userId);

  // Full overwrite
  if (Array.isArray(body?.glasses) && body.glasses.length === 8) {
    const glasses = body.glasses.map((v: any) => Boolean(v));
    await userRef.set({ hydration: { glasses, updatedAt: new Date().toISOString() } }, { merge: true });
    return NextResponse.json({ ok: true });
  }

  // Single update
  const glassIndex = Number(body?.glassIndex);
  const state = body?.state;
  if (Number.isInteger(glassIndex) && glassIndex >= 0 && glassIndex < 8 && typeof state === "boolean") {
    const userDoc = await userRef.get();
    const hydration: boolean[] = new Array(8).fill(false);
    if (userDoc.exists) {
      const stored = userDoc.data()?.hydration?.glasses;
      if (Array.isArray(stored)) {
        stored.slice(0, 8).forEach((v: any, i: number) => (hydration[i] = Boolean(v)));
      }
    }
    hydration[glassIndex] = state;
    await userRef.set({ hydration: { glasses: hydration, updatedAt: new Date().toISOString() } }, { merge: true });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}

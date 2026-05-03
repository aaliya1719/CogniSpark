import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await db.collection(COLLECTIONS.USERS).doc(userId).collection(COLLECTIONS.TODOS).orderBy("createdAt", "desc").get();
  
  const todos = snapshot.docs.map((doc) => sanitizeJson({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ todos });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const docRef = await db.collection(COLLECTIONS.USERS).doc(userId).collection(COLLECTIONS.TODOS).add({
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ id: docRef.id });
}

function sanitizeJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

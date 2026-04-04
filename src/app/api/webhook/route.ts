import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ message: 'Em breve' }, { status: 501 });
}

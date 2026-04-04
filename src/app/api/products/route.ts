import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ message: 'Em breve' }, { status: 501 });
}

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const res = NextResponse.json({ message: 'Logged out' });
    // Clear cookie set by login
    res.cookies.set('expense_token', '', { maxAge: 0, path: '/' });
    return res;
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}

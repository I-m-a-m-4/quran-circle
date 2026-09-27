import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/users-db';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    let email = 'bello@example.com';
    try {
      const req = request as any;
      if (req && req.url) {
        const { searchParams } = new URL(req.url);
        email = searchParams.get('email') || email;
      }
    } catch {}
    
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    return NextResponse.json({ streak: user ? user.streak : 0 });
  } catch (error) {
    return NextResponse.json({ streak: 0 });
  }
}

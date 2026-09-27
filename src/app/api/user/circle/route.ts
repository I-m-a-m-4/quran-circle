import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/users-db';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    let email = '';
    try {
      const req = request as any;
      if (req && req.url) {
        const { searchParams } = new URL(req.url);
        email = searchParams.get('email') || '';
      }
    } catch {}

    const users = getUsers();
    const currentUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!currentUser) {
      return NextResponse.json({
        name: 'Faith Seekers',
        members: [],
        completedCount: 0,
        membersCount: 0
      });
    }

    const circleUsernames = new Set([currentUser.username, ...(currentUser.circleMembers || [])]);
    const circleUsers = users.filter(u => circleUsernames.has(u.username));

    return NextResponse.json({
      name: 'Faith Seekers',
      members: circleUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        streak: u.streak,
        status: u.completedToday ? 'Completed' : 'Pending',
        avatar: u.avatar
      })),
      completedCount: circleUsers.filter(u => u.completedToday).length,
      membersCount: circleUsers.length
    });
  } catch (error) {
    return NextResponse.json({ name: 'Faith Seekers', members: [], completedCount: 0, membersCount: 0 });
  }
}

import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/users-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || '';

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

    // Filter to only include the current user + members they have explicitly added
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
    console.error('Circle API error:', error);
    return NextResponse.json({ error: 'Failed to fetch circle data' }, { status: 500 });
  }
}

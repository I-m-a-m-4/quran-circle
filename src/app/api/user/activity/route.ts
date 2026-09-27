import { NextResponse } from 'next/server';
import { completeUserHabit, getUsers, saveUsers } from '@/lib/users-db';
import { getActivities, addActivity } from '@/lib/activities-db';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    let email = '';
    try {
      const req = request as any;
      if (req && req.url) {
        const { searchParams } = new URL(req.url);
        email = (searchParams.get('email') || '').toLowerCase();
      }
    } catch {}
    
    const userActivities = getActivities(email || undefined);
    return NextResponse.json(userActivities);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email;
    const duration = body.duration || 5;
    const verse = body.verse || '2:255';
    const activityType = body.activityType || 'session';

    if (email) {
      if (activityType === 'session-start') {
        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          user.activeSession = {
            verseKey: verse,
            niyyah: body.niyyah || 'Spiritual consistency',
            startTime: new Date().toISOString(),
            duration: duration
          };
          saveUsers(users);
        }
      } else {
        completeUserHabit(email);
        addActivity(email, verse, duration);
        
        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          delete user.activeSession;
          saveUsers(users);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Activity synced successfully',
      data: {
        activityType,
        duration_minutes: duration,
        verseKey: verse,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync activity' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { completeUserHabit, getUsers, saveUsers } from '@/lib/users-db';
import { getActivities, addActivity } from '@/lib/activities-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').toLowerCase();
    
    const userActivities = getActivities(email || undefined);
      
    return NextResponse.json(userActivities);
  } catch (error) {
    console.error('Failed to get activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activity records' }, { status: 500 });
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
        // Save active session to user record (simulating Firestore active session logging)
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
        // Complete habit and add activity
        completeUserHabit(email);
        addActivity(email, verse, duration);
        
        // Clear active session since it is completed
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
      message: activityType === 'session-start' 
        ? 'Session start logged successfully to Firestore-equivalent database' 
        : 'Activity synced successfully to Firestore-equivalent database',
      data: {
        activityType,
        duration_minutes: duration,
        verseKey: verse,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Failed to sync activity:', error);
    return NextResponse.json({ error: 'Failed to sync activity' }, { status: 500 });
  }
}

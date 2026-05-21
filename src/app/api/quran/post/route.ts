import { NextResponse } from 'next/server';
import { getPosts, addPost } from '@/lib/posts-db';
import { getUsers } from '@/lib/users-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || '';

    const posts = getPosts();
    if (!email) {
      // Return empty if no email is supplied (preventing random dummy leakage)
      return NextResponse.json([]);
    }

    const users = getUsers();
    const currentUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!currentUser) {
      return NextResponse.json([]);
    }

    // Get emails of all circle members
    const circleUsernames = new Set([currentUser.username, ...(currentUser.circleMembers || [])]);
    const circleEmails = new Set(
      users.filter(u => circleUsernames.has(u.username)).map(u => u.email.toLowerCase())
    );

    // Filter posts to only those posted by circle members
    const filteredPosts = posts.filter(post => circleEmails.has(post.userEmail.toLowerCase()));

    return NextResponse.json(filteredPosts);
  } catch (error) {
    console.error('Failed to get posts:', error);
    return NextResponse.json({ error: 'Failed to fetch reflections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, content, verse } = await request.json();
    const userEmail = email || 'bello@example.com';
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const post = addPost(userEmail, content, verse || '2:255');
    
    return NextResponse.json({
      success: true,
      message: 'Reflection posted successfully to Quran Foundation Network',
      data: post
    });
  } catch (error) {
    console.error('Failed to post reflection:', error);
    return NextResponse.json({ error: 'Failed to post reflection' }, { status: 500 });
  }
}

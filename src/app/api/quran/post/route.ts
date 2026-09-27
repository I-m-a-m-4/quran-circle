import { NextResponse } from 'next/server';
import { getPosts, addPost } from '@/lib/posts-db';
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

    const posts = getPosts();
    if (!email) {
      return NextResponse.json([]);
    }

    const users = getUsers();
    const currentUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!currentUser) {
      return NextResponse.json([]);
    }

    const circleUsernames = new Set([currentUser.username, ...(currentUser.circleMembers || [])]);
    const circleEmails = new Set(
      users.filter(u => circleUsernames.has(u.username)).map(u => u.email.toLowerCase())
    );

    const filteredPosts = posts.filter(post => circleEmails.has(post.userEmail.toLowerCase()));
    return NextResponse.json(filteredPosts);
  } catch (error) {
    return NextResponse.json([]);
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
      message: 'Reflection posted successfully',
      data: post
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post reflection' }, { status: 500 });
  }
}

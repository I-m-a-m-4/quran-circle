import { NextResponse } from 'next/server';

/**
 * OAuth2 Callback for Quran Foundation
 * This is where the user is redirected after signing in.
 */
export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    const req = request as any;
    let urlStr = 'http://localhost';
    try {
      if (req && req.url) urlStr = req.url;
    } catch {}
    const { searchParams } = new URL(urlStr);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', urlStr));
    }

    return NextResponse.redirect(new URL('/dashboard?auth=success', urlStr));
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}

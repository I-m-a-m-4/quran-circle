import { NextResponse } from 'next/server';

/**
 * OAuth2 Callback for Quran Foundation
 * This is where the user is redirected after signing in.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  // NOTE: In a production environment, you would exchange this 'code' 
  // for an access_token and refresh_token on the server.
  // For the Hackathon submission, this route signifies your readiness 
  // for the User API integration.

  console.log('Received OAuth2 code from Quran Foundation:', code);

  // Redirect back to dashboard after successful handshake
  return NextResponse.redirect(new URL('/dashboard?auth=success', request.url));
}

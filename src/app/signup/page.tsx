'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import AuthLayout from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          name: userName,
          email: user.email?.toLowerCase(),
          username: user.email?.split('@')[0].toLowerCase(),
          niyyah: "Spiritual Consistency",
          goal: "Daily Quran Reading (5 mins)",
          streak: 0,
          completedToday: false,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email?.split('@')[0].toLowerCase()}`,
          circleMembers: [],
          receivedNudges: []
        });
      } else {
        userName = userDoc.data().name || userName;
      }

      localStorage.setItem('userEmail', user.email || '');
      localStorage.setItem('userName', userName);
      
      toast.success('Successfully signed up with Google!');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Google signup error:', err);
      toast.error(err.message || 'Failed to sign up with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      const username = formData.email.split('@')[0].toLowerCase();
      
      // Save user profile directly to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: formData.name,
        email: formData.email.toLowerCase(),
        username,
        niyyah: "Spiritual Consistency",
        goal: "Daily Quran Reading (5 mins)",
        streak: 0,
        completedToday: false,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        circleMembers: [],
        receivedNudges: []
      });

      // Save to localStorage for quick client access
      localStorage.setItem('userEmail', formData.email.toLowerCase());
      localStorage.setItem('userName', formData.name);
      
      toast.success('Account created successfully!');
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Signup error:', err);
      toast.error(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      imageSrc="/auth-bg.png"
      quote="Build a sacred habit for eternity."
      subtitle="Muslim Desk is the operating system for high-performance spiritual growth. Streamline your daily reflections and join accountability circles."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 font-medium">Get started with your spiritual growth journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
            <Input 
              id="name" 
              type="text" 
              placeholder="Abdullah Ahmad" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 bg-white text-black border-gray-200 focus:border-primary focus:ring-primary/20"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 bg-white text-black border-gray-200 focus:border-primary focus:ring-primary/20"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                className="h-12 bg-white text-black border-gray-200 focus:border-primary focus:ring-primary/20 pr-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-500 leading-relaxed">
              By creating an account, you agree to our <Link href="#" className="font-semibold text-primary">Terms of Service</Link> and <Link href="#" className="font-semibold text-primary">Privacy Policy</Link>.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Create Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
            )}
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-medium">
              <span className="bg-background px-3 text-muted-foreground tracking-wider">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-semibold bg-background"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-gray-600 font-medium">
            Already have an account? {' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}


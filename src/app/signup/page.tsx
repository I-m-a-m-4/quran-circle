'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userName', formData.name);
        router.push('/onboarding');
      } else {
        alert(data.error || 'Failed to sign up');
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Fallback to local storage for offline / testing
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.name);
      router.push('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      imageSrc="/auth-bg.png"
      quote="Build a sacred habit for eternity."
      subtitle="Quran Circle is the operating system for high-performance spiritual growth. Streamline your daily reflections and join accountability circles."
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
            className="w-full h-12 bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all rounded-lg mt-6 shadow-lg shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Started'}
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

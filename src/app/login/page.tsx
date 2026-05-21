'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'm@example.com',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    let derivedName = formData.email.split('@')[0];
    derivedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    derivedName = derivedName.replace(/[._]/g, ' ');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: derivedName || 'Bello Imam', email: formData.email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userName', data.user.name);
        router.push('/dashboard');
      } else {
        alert(data.error || 'Failed to login');
      }
    } catch (err) {
      console.error('Login error:', err);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', derivedName || 'Bello Imam');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      imageSrc="/auth-bg.png"
      quote="Consistency leads to spiritual velocity."
      subtitle="Join a community of believers dedicated to building a lasting Quran habit through accountability and insight."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Login</h1>
          <p className="text-gray-500 font-medium">Enter your email below to login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <Link href="#" className="text-sm font-semibold text-primary hover:text-primary/80">
                Forgot your password?
              </Link>
            </div>
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

          <Button 
            type="submit" 
            className="w-full h-12 bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all rounded-lg mt-6 shadow-lg shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Login'}
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-gray-600 font-medium">
            Don't have an account? {' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

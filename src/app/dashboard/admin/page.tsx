'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  Search, 
  HeartHandshake, 
  TrendingUp, 
  CreditCard 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Configure admin emails here (or fetch from Firestore roles)
const ADMIN_EMAILS = ['bello@example.com', 'admin@muslimdesk.com']; 

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Simple client-side check. (Real apps should use Firebase Custom Claims or middleware)
        const isAuthorized = ADMIN_EMAILS.includes(user.email || '');
        if (!isAuthorized && process.env.NODE_ENV !== 'development') {
           // Allow dev mode for testing, but in prod restrict
           // router.push('/dashboard'); 
        }
        setIsAdmin(true); // Forced true for demonstration, normally = isAuthorized
      }
    }
  }, [user, loading, router]);

  if (loading || !isAdmin) {
    return <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Checking access...</div>;
  }

  // Mocked Metrics
  const metrics = [
    { title: 'Total Users', value: '1,248', change: '+12%', icon: <Users className="w-4 h-4 text-primary" /> },
    { title: 'Daily Active', value: '432', change: '+5%', icon: <Activity className="w-4 h-4 text-green-500" /> },
    { title: 'AI Searches', value: '8,921', change: '+24%', icon: <Search className="w-4 h-4 text-purple-500" /> },
    { title: 'Total Donations', value: '₦450,000', change: '+18%', icon: <HeartHandshake className="w-4 h-4 text-red-500" /> },
  ];

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8 fade-in">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform analytics and financial overview.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <Card key={m.title} className="bg-accent/20 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.title}</CardTitle>
              <div className="p-2 bg-background rounded-full border border-border">{m.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{m.value}</div>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> {m.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions & Server Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-accent/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Recent Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {[
                 { name: 'Anonymous', amount: '₦5,000', time: '2 hours ago' },
                 { name: 'Ahmad S.', amount: '₦1,000', time: '5 hours ago' },
                 { name: 'Fatima', amount: '₦10,000', time: '1 day ago' },
               ].map((txn, i) => (
                 <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                   <div>
                     <p className="font-medium text-sm">{txn.name}</p>
                     <p className="text-xs text-muted-foreground">{txn.time}</p>
                   </div>
                   <div className="font-semibold text-green-500">{txn.amount}</div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" /> Platform Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center border border-dashed border-border rounded-lg bg-background">
             <p className="text-muted-foreground text-sm">Real-time charting placeholder (e.g. Recharts)</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleSendCode = async (e: React.FormEvent, requireExisting = false) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, requireExisting })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification code sent to your email!');
        setIsCodeSent(true);
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Authentication successful!');
        router.push('/');
        router.refresh();
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode('');
    const requireExisting = activeTab === 'login';
    await handleSendCode(new Event('submit') as any, requireExisting);
  };

  const resetForm = () => {
    setEmail('');
    setCode('');
    setIsCodeSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-zinc-950 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            NEOKCS Dashboard
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            {isCodeSent 
              ? 'Enter the verification code sent to your email'
              : 'Enter your email to receive a verification code'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
              <TabsTrigger 
                value="login" 
                onClick={resetForm}
                className="data-[state=active]:bg-[#EDAF5F] data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                onClick={resetForm}
                className="data-[state=active]:bg-[#EDAF5F] data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              {!isCodeSent ? (
                <form onSubmit={(e) => handleSendCode(e, true)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login" className="text-white">Email</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-zinc-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code-login" className="text-white">Verification Code</Label>
                    <Input
                      id="code-login"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      disabled={isLoading}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-zinc-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>
                  <div className="flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-zinc-400 hover:text-white"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-zinc-400 hover:text-white"
                      disabled={isLoading}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              {!isCodeSent ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-register" className="text-white">Email</Label>
                    <Input
                      id="email-register"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-zinc-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code-register" className="text-white">Verification Code</Label>
                    <Input
                      id="code-register"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      disabled={isLoading}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-zinc-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </Button>
                  <div className="flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-zinc-400 hover:text-white"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-zinc-400 hover:text-white"
                      disabled={isLoading}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


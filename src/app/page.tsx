import AuthSplash from '@/components/auth/AuthSplash';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-bg relative overflow-hidden">
      {/* Background glowing particles effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary opacity-5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-primary opacity-5 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="relative z-10 w-full">
        <AuthSplash />
      </div>
    </main>
  );
}

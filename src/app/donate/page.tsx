import Image from 'next/image';

export default function DonatePage() {
  return (
    <div className="max-w-lg mx-auto p-6 md:p-12 text-center space-y-8">
      <h1 className="text-3xl font-bold">Support This Songbook</h1>
      <p className="text-slate-600 dark:text-slate-400">
        If you have been blessed by these songs, you can voluntarily support the maintenance and hosting of this website. 
      </p>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 inline-block">
        <Image src="/qr-code.png" alt="UPI QR Code" width={300} height={300} className="mx-auto rounded-md" />
        
        <div className="mt-6 p-3 bg-slate-100 rounded-lg text-sm font-bold text-slate-800 select-all cursor-pointer">
          ebenezertrustofindia1@fbl
        </div>
        <p className="mt-2 text-xs text-slate-500">Tap to copy UPI ID</p>
      </div>

      <p className="text-sm text-slate-500">
        Donations are entirely optional.
      </p>
    </div>
  );
}
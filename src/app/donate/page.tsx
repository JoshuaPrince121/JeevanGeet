import Image from 'next/image';

export default function DonatePage() {
  return (
    <div className="max-w-lg mx-auto p-6 md:p-12 text-center space-y-8">
      <h1 className="text-3xl font-bold">Support This Songbook</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        If you have been blessed by these songs, you can voluntarily support the maintenance and hosting of this website. 
      </p>

      <div className="inline-block border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <Image src="/qr-code.png" alt="UPI QR Code" width={300} height={300} className="mx-auto rounded-md" />
        
        <div className="mt-6 cursor-pointer bg-neutral-100 p-3 text-sm font-bold text-neutral-800 select-all dark:bg-neutral-800 dark:text-neutral-100">
          ebenezertrustofindia1@fbl
        </div>
        <p className="mt-2 text-xs text-neutral-500">Tap to copy UPI ID</p>
      </div>

      <p className="text-sm text-neutral-500">
        Donations are entirely optional.
      </p>
    </div>
  );
}
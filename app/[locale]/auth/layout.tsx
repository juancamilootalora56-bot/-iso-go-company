import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/logo.jpg"
              alt="Iso Go Company"
              width={72}
              height={80}
              priority
              className="rounded-lg"
            />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

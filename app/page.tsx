import Image from "next/image";
import ModernScheduleMaker from '../components/ModernScheduleMaker'
import '../app/globals.css'; 

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="fixed top-4 left-4">
        <Image
          src={`${process.env.GITHUB_PAGES ? '/ShiftsMaker' : ''}/InDrive_Logo.png`}
          alt="InDrive Logo"
          width={120}
          height={40}
          className="dark:invert"
          priority
        />
      </header>
      <main>
        <ModernScheduleMaker />
      </main>
      <footer className="mt-8 text-center text-sm text-gray-500">
        2024 Modern Schedule Maker
      </footer>
    </div>
  );
}
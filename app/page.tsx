import ModernScheduleMaker from '../components/ModernScheduleMaker'

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Modern Schedule Maker</h1>
      </header>
      <main>
        <ModernScheduleMaker />
      </main>
      <footer className="mt-8 text-center text-sm text-gray-500">
        © 2024 Modern Schedule Maker
      </footer>
    </div>
  )
}
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

function Navbar() {
  return (
    
    <><header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#efecec] dark:border-white/10">
      
      <div className="max-w-360 mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link className="flex items-center gap-2 group" href="/  ">
           
              <div className="h-14 w-12">
 <img src="/logo.png" alt="Logo" className="h-full w-auto"/>
</div>

            <span className="font-display text-2xl font-bold tracking-tight">Richse</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            <Link
  href="/ProductAll"
  className="group relative text-sm font-medium transition-colors hover:text-primary"
>
  Shop All
  <span className="absolute left-0 -bottom-1 h-px w-full scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
</Link>

            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">Treatments</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">Our Story</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">The Journal</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden sm:flex items-center bg-[#efecec] dark:bg-white/5 rounded-full px-4 py-1.5">
            <span className="material-symbols-outlined text-sm opacity-60">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-400 w-32 md:w-48" placeholder="Search rituals..." type="text" />
          </div>
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">person</span>
          </button>
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors relative">
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="absolute top-1 right-1 size-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
    </>
  )
}

export default Navbar

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">Nutrilens</span>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/terms" legacyBehavior>
            <a className="text-sm hover:underline">Terms</a>
          </Link>
          <Link href="/privacy" legacyBehavior>
            <a className="text-sm hover:underline">Privacy</a>
          </Link>
          <Link href="/contact" legacyBehavior>
            <a className="text-sm hover:underline">Contact</a>
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Nutrilens. All rights reserved.</p>
        <p className="text-sm text-muted-foreground mt-1">Designed and Developed by Aryan Gaikwad</p>
      </div>
    </footer>
  )
}


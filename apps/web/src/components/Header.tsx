import { Button } from '@spark-ui/components/button'
import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-sticky border-b-sm border-outline bg-surface px-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-lg gap-y-md py-md">
        <h2 className="m-0 shrink-0 text-headline-1">
          <Link
            to="/"
            className="text-main no-underline hover:text-main-hovered"
          >
            Second-Hand Marketplace
          </Link>
        </h2>

        <div className="order-3 flex w-full items-center gap-lg text-body-2-highlight sm:order-none sm:w-auto">
          <Link
            to="/"
            className="text-on-surface/dim-1 no-underline hover:text-on-surface"
            activeProps={{ className: 'text-on-surface underline' }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-md">
          <Button asChild>
            <Link to="/annonces/deposer">Déposer une annonce</Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-3xl border-t-sm border-outline px-lg pt-xl pb-3xl text-on-background/dim-1">
      <div className="page-wrap text-center text-body-2">
        <p className="m-0">&copy; {year} Second-Hand Marketplace</p>
      </div>
    </footer>
  )
}

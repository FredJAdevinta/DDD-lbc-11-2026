const eurosRonds = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const eurosEtCentimes = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
})

const dates = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeZone: 'Europe/Paris',
})

// Euros without decimals when the prix is round; a prix of zero is a don.
export function formatPrix(centimes: number): string {
  if (centimes === 0) {
    return 'Don'
  }
  const format = centimes % 100 === 0 ? eurosRonds : eurosEtCentimes
  return format.format(centimes / 100)
}

// The time zone is fixed so the server and the browser render the same date.
export function formatDeposeeLe(iso: string): string {
  return dates.format(new Date(iso))
}

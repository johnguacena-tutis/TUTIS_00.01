export const dynamic = 'force-dynamic'

import { getOfferings } from '@/features/offerings/queries'
import OfferingsTable from '@/features/offerings/components/OfferingsTable'
import AddOfferingButton from '@/features/offerings/components/AddOfferingButton'
import TableHeader from '@/components/ui/TableHeader'

export default async function OfferingsPage() {
  const offerings = await getOfferings()
  const now = new Date()

  const counts = {
    all:       offerings.length,
    active:    offerings.filter((o) => !o.archived && (o.end_timestamp === null || new Date(o.end_timestamp) >= now)).length,
    completed: offerings.filter((o) => !o.archived && o.end_timestamp !== null && new Date(o.end_timestamp) < now).length,
    archived:  offerings.filter((o) => o.archived).length,
  }

  return (
    <div>
      <TableHeader title="Offerings" count={offerings.length} favKey="offerings">
        <AddOfferingButton />
      </TableHeader>
      <OfferingsTable offerings={offerings} counts={counts} />
    </div>
  )
}

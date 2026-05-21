import { createClient } from '@supabase/supabase-js'
import OfferingsTable from '@/components/OfferingsTable'
import AddOfferingButton from '@/components/AddOfferingButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: 'enterprise_uat' } }
)

async function getOfferings() {
  // Step 1 — get offering versions
  const { data: versions, error: vErr } = await supabase
    .from('offeringversions')
    .select(`
      offering_version_id,
      offering_id,
      code,
      title,
      start_timestamp,
      end_timestamp,
      default_trainer_person_id
    `)
    .order('start_timestamp', { ascending: false })
    .limit(50)

  if (vErr || !versions) { console.error(vErr); return [] }

  // Step 2 — get offerings (for enrolment counts)
  const offeringIds = [...new Set(versions.map((v) => v.offering_id))]
  const { data: offerings, error: oErr } = await supabase
    .from('offerings')
    .select('offering_id, number_enrolled, available_places, archived')
    .in('offering_id', offeringIds)

  if (oErr) { console.error(oErr); return [] }

  const offeringMap = Object.fromEntries(
    (offerings ?? []).map((o) => [o.offering_id, o])
  )

  // Step 3 — get trainer names
  const trainerIds = [...new Set(
    versions.map((v) => v.default_trainer_person_id).filter(Boolean)
  )]
  const { data: trainers } = trainerIds.length
    ? await supabase
        .from('persons')
        .select('person_id, first_name, surname')
        .in('person_id', trainerIds)
    : { data: [] }

  const trainerMap = Object.fromEntries(
    (trainers ?? []).map((p) => [
      p.person_id,
      `${p.first_name ?? ''} ${p.surname ?? ''}`.trim(),
    ])
  )

  const now = new Date()

  // Step 4 — merge all offerings including archived
  return versions
    .filter((v) => offeringMap[v.offering_id])
    .map((v) => ({
      offering_version_id: v.offering_version_id,
      offering_id: v.offering_id,
      code: v.code,
      title: v.title,
      number_enrolled: offeringMap[v.offering_id]?.number_enrolled ?? null,
      available_places: offeringMap[v.offering_id]?.available_places ?? null,
      start_timestamp: v.start_timestamp,
      end_timestamp: v.end_timestamp,
      archived: offeringMap[v.offering_id]?.archived ?? false,
      trainer_name: v.default_trainer_person_id
        ? trainerMap[v.default_trainer_person_id] ?? null
        : null,
    }))
}

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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Offerings
          </h1>
        </div>
        <AddOfferingButton />
      </div>
      <OfferingsTable offerings={offerings} counts={counts} />
    </div>
  )
}

import { createClient } from '@supabase/supabase-js'
import type { Offering } from './types'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'enterprise_uat' } }
  )
}

export async function getOfferings(): Promise<Offering[]> {
  const supabase = getClient()
  const { data: versions, error: vErr } = await supabase
    .from('offeringversions_current')
    .select('offering_version_id, offering_id, code, title, start_timestamp, end_timestamp, default_trainer_person_id')
    .order('start_timestamp', { ascending: false })
    .limit(200)

  if (vErr || !versions) { console.error(vErr); return [] }

  const offeringIds = [...new Set(versions.map((v) => v.offering_id))]
  const { data: offerings, error: oErr } = await supabase
    .from('offerings')
    .select('offering_id, number_enrolled, available_places, archived')
    .in('offering_id', offeringIds)

  if (oErr) { console.error(oErr); return [] }

  const offeringMap = Object.fromEntries((offerings ?? []).map((o) => [o.offering_id, o]))

  const trainerIds = [...new Set(versions.map((v) => v.default_trainer_person_id).filter(Boolean))]
  const { data: trainers } = trainerIds.length
    ? await supabase.from('persons').select('person_id, first_name, surname').in('person_id', trainerIds)
    : { data: [] }

  const trainerMap = Object.fromEntries(
    (trainers ?? []).map((p: any) => [p.person_id, `${p.first_name ?? ''} ${p.surname ?? ''}`.trim()])
  )

  return versions
    .filter((v) => offeringMap[v.offering_id])
    .map((v) => ({
      offering_version_id: v.offering_version_id,
      offering_id:         v.offering_id,
      code:                v.code,
      title:               v.title,
      number_enrolled:     offeringMap[v.offering_id]?.number_enrolled ?? null,
      available_places:    offeringMap[v.offering_id]?.available_places ?? null,
      start_timestamp:     v.start_timestamp,
      end_timestamp:       v.end_timestamp,
      archived:            offeringMap[v.offering_id]?.archived ?? false,
      trainer_name:        v.default_trainer_person_id ? trainerMap[v.default_trainer_person_id] ?? null : null,
    }))
}

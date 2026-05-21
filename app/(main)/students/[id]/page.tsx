import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import StudentDetail from '@/components/StudentDetail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: 'enterprise_uat' } }
)

async function getStudent(id: number) {
  const { data, error } = await supabase
    .from('persons')
    .select(`
      person_id, code, first_name, other_names, surname,
      preferred_name, date_of_birth, status, archived,
      organisation_id, position_id
    `)
    .eq('person_id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getStudentEmail(id: number) {
  const { data } = await supabase
    .from('personemailaddresses_default')
    .select('email_address')
    .eq('person_id', id)
    .single()
  return data?.email_address ?? null
}

async function getEnrolments(id: number) {
  const { data, error } = await supabase
    .from('enrolments')
    .select(`
      enrolment_id,
      enrolmentversions_current!inner (
        code,
        enrolment_date,
        planned_completion_date,
        trainer_person_id,
        offering_id
      ),
      enrolments_statuses (
        status
      )
    `)
    .eq('person_id', id)

  if (error || !data) return []

  const offeringIds = [...new Set(
    data.map((e: any) => e.enrolmentversions_current?.offering_id).filter(Boolean)
  )]

  const trainerIds = [...new Set(
    data.map((e: any) => e.enrolmentversions_current?.trainer_person_id).filter(Boolean)
  )]

  const [{ data: offerings }, { data: trainers }] = await Promise.all([
    offeringIds.length
      ? supabase
          .from('offeringversions_current')
          .select('offering_id, code, training_object_version_id')
          .in('offering_id', offeringIds)
      : { data: [] },
    trainerIds.length
      ? supabase
          .from('persons')
          .select('person_id, first_name, surname')
          .in('person_id', trainerIds)
      : { data: [] },
  ])

  const tovIds = [...new Set(
    (offerings ?? []).map((o: any) => o.training_object_version_id).filter(Boolean)
  )]

  const { data: tovs } = tovIds.length
    ? await supabase
        .from('trainingobjectversions')
        .select('training_object_version_id, title')
        .in('training_object_version_id', tovIds)
    : { data: [] }

  const offeringMap = Object.fromEntries((offerings ?? []).map((o: any) => [o.offering_id, o]))
  const trainerMap = Object.fromEntries((trainers ?? []).map((p: any) => [p.person_id, `${p.first_name ?? ''} ${p.surname ?? ''}`.trim()]))
  const tovMap = Object.fromEntries((tovs ?? []).map((t: any) => [t.training_object_version_id, t.title]))

  return data.map((e: any) => {
    const ev = e.enrolmentversions_current
    const offering = offeringMap[ev?.offering_id]
    const rawStatus = e.enrolments_statuses?.status ?? ''
    const status = rawStatus.replace('#{label_', '').replace('}', '')
    return {
      enrolment_id: e.enrolment_id,
      code: ev?.code ?? null,
      qualification_course: offering ? (tovMap[offering.training_object_version_id] ?? null) : null,
      offering_code: offering?.code ?? null,
      trainer: ev?.trainer_person_id ? trainerMap[ev.trainer_person_id] ?? null : null,
      started: ev?.enrolment_date ?? null,
      end_date: ev?.planned_completion_date ?? null,
      status,
    }
  })
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const [{ id: idStr }, { edit }] = await Promise.all([params, searchParams])
  const id = parseInt(idStr)
  if (isNaN(id)) notFound()

  const [student, email, enrolments] = await Promise.all([
    getStudent(id),
    getStudentEmail(id),
    getEnrolments(id),
  ])

  if (!student) notFound()

  return (
    <StudentDetail
      student={{ ...student, email }}
      enrolments={enrolments}
      initialEditing={edit === 'true'}
    />
  )
}

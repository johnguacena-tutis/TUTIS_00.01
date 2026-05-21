import { notFound } from 'next/navigation'
import { getStudent, getStudentEmail, getEnrolments } from '@/features/students/queries'
import StudentDetail from '@/features/students/components/StudentDetail'

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

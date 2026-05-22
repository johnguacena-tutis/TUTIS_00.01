export const dynamic = 'force-dynamic'

import { getStudents } from '@/features/students/queries'
import StudentsTable from '@/features/students/components/StudentsTable'
import AddStudentButton from '@/features/students/components/AddStudentButton'
import TableHeader from '@/components/ui/TableHeader'

export default async function StudentsPage() {
  const students = await getStudents()

  const counts = {
    all:      students.length,
    active:   students.filter((s) => s.status === 'ACTIVE'   && !s.archived).length,
    inactive: students.filter((s) => s.status === 'INACTIVE' && !s.archived).length,
    archived: students.filter((s) => s.archived).length,
  }

  return (
    <div>
      <TableHeader title="Students" count={students.length} favKey="students">
        <AddStudentButton />
      </TableHeader>
      <StudentsTable students={students} counts={counts} />
    </div>
  )
}

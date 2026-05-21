import { createClient } from '@supabase/supabase-js'
import StudentsTable from '@/components/StudentsTable'
import AddStudentButton from '@/components/AddStudentButton'
import TableHeader from '@/components/TableHeader'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: 'enterprise_uat' } }
)

async function getStudents() {
  const { data, error } = await supabase
    .from('persons')
    .select(`
      person_id,
      code,
      first_name,
      surname,
      date_of_birth,
      organisation_id,
      position_id,
      archived,
      status
    `)
    .order('surname', { ascending: true })
    .limit(200)

  if (error) {
    console.error(error)
    return []
  }
  return data ?? []
}

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

export type Student = {
  person_id: number
  code: string | null
  first_name: string | null
  surname: string | null
  date_of_birth: string | null
  organisation_id: number | null
  position_id: number | null
  archived: boolean
  status: string | null
}

export type StudentDetail = {
  person_id: number
  code: string | null
  first_name: string | null
  other_names: string | null
  surname: string | null
  preferred_name: string | null
  date_of_birth: string | null
  status: string | null
  archived: boolean
  organisation_id: number | null
  position_id: number | null
  email?: string | null
}


export type Enrolment = {
  enrolment_id: number
  code: string | null
  qualification_course: string | null
  offering_code: string | null
  trainer: string | null
  started: string | null
  end_date: string | null
  status: string
}

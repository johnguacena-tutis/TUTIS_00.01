export type Offering = {
  offering_version_id: number
  offering_id: number
  code: string | null
  title: string | null
  number_enrolled: number | null
  available_places: number | null
  start_timestamp: string | null
  end_timestamp: string | null
  trainer_name: string | null
  archived: boolean
}

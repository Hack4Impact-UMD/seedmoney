export type CompetitionMetadata = {
  competition_id: number,
  start_date: string,
  end_date: string,
  publish_at?: string | null,
  is_current: boolean
  is_application_open: boolean
}
export interface Config {
  id: number
  grid_size: number
  created_at: string
}

export interface Challenge {
  id: string
  text: string
  created_at: string
}

export interface Prize {
  id: string
  name: string
  won_by: string | null
  created_at: string
}

export interface Player {
  id: string
  name: string
  card_token: string
  created_at: string
}

export interface Card {
  id: string
  player_id: string
  challenge_id: string
  row: number
  col: number
  completed: boolean
}

export interface ClaimedLine {
  id: string
  player_id: string
  line_type: 'row' | 'col' | 'diagonal'
  line_index: number
  is_first: boolean
  prize_id: string | null
  created_at: string
}

export interface CardCell extends Card {
  challenge_text: string
}

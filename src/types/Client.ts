
export interface Client {
  id: string;
  name: string;
  description: string;
  color?: string;
  is_public?: boolean;
  user_id?: string;
}

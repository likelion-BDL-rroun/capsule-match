export type University = {
  id: string;
  name: string;
  open_code_hash: string;
  assigned_character_id: string | null;
  assigned_at: string | null;
  created_at: string;
};

export type Character = {
  id: string;
  name: string;
  image_url: string | null;
  status: 'available' | 'assigned';
  assigned_university_id: string | null;
  assigned_at: string | null;
  created_at: string;
};

export type AssignmentLog = {
  id: string;
  university_id: string;
  character_id: string;
  assigned_at: string;
  user_agent: string | null;
  ip_hash: string | null;
};

export type AssignResult = {
  success: boolean;
  character?: Character;
  university?: University;
  error?: string;
  alreadyAssigned?: boolean;
};

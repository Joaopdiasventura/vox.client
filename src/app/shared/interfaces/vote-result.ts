import { Group } from '../models/group';

export interface VoteResult {
  group: Group;
  participants: ParticipantResult[];
}

interface ParticipantResult {
  _id: string;
  name: string;
  votes: number;
}

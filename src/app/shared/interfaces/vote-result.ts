import { Group } from '../../core/models/group';

export interface VoteResult {
  group: Group;
  participants: ParticipantResult[];
}

interface ParticipantResult {
  _id: string;
  name: string;
  votes: number;
}

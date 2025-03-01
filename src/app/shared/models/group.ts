import { User } from './user';

export interface Group {
  _id: string;
  name: string;
  user: string | User;
  group?: string | Group;
}

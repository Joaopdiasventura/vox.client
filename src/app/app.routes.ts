import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { AccessComponent } from './pages/user/access/access.component';
import { FindGroupComponent } from './pages/group/find-group/find-group.component';
import { AddGroupComponent } from './pages/group/add-group/add-group.component';
import { AddParticipantComponent } from './pages/participant/add-participant/add-participant.component';
import { StartVoteComponent } from './pages/vote/start-vote/start-vote.component';
import { FollowVoteComponent } from './pages/vote/follow-vote/follow-vote.component';

export const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'access', component: AccessComponent },
  { path: 'group/:token/:id', component: FindGroupComponent },
  { path: 'group/add', component: AddGroupComponent },
  { path: 'participant/add', component: AddParticipantComponent },
  { path: 'votes/start', component: StartVoteComponent },
  { path: 'votes/follow', component: FollowVoteComponent },
];

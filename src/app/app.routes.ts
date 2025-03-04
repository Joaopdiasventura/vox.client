import { Routes } from '@angular/router';
import { IndexComponent } from './features/index/index.component';
import { AccessComponent } from './features/user/access/access.component';
import { FindGroupComponent } from './features/group/find-group/find-group.component';
import { AddGroupComponent } from './features/group/add-group/add-group.component';
import { AddParticipantComponent } from './features/participant/add-participant/add-participant.component';
import { StartVoteComponent } from './features/vote/start-vote/start-vote.component';
import { FollowVoteComponent } from './features/vote/follow-vote/follow-vote.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: IndexComponent, canActivate: [AuthGuard] },
  { path: 'access', component: AccessComponent },
  { path: 'group/add', component: AddGroupComponent, canActivate: [AuthGuard] },
  {
    path: 'group/:id',
    component: FindGroupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'participant/add',
    component: AddParticipantComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'votes/start',
    component: StartVoteComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'votes/follow',
    component: FollowVoteComponent,
    canActivate: [AuthGuard],
  },
];

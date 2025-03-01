import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { isPlatformServer } from '@angular/common';
import { GroupService } from '../../../shared/services/group.service';
import { UserService } from '../../../shared/services/user.service';
import { WebSocketService } from '../../../shared/services/websocket.service';
import { Router } from '@angular/router';
import { User } from '../../../shared/models/user';
import { Socket } from 'socket.io-client';
import { Group } from '../../../shared/models/group';
import { VoteResult } from '../../../shared/interfaces/vote-result';
import { AccessInputComponent } from '../../../shared/components/inputs/access-input/access-input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-follow-vote',
  imports: [
    LoadingComponent,
    HeaderComponent,
    AccessInputComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './follow-vote.component.html',
  styleUrl: './follow-vote.component.scss',
})
export class FollowVoteComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  currentUser: User | null = null;
  currentGroups: Group[] = [];
  selectedGroup!: Group;
  voteResult!: VoteResult;

  voteId: string = '';

  urn: string = '';

  private socket!: Socket;

  private userObservable = new BehaviorSubject<User | null>(null);

  private platformId = inject(PLATFORM_ID);
  private webSocketService = inject(WebSocketService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  public ngOnInit(): void {
    if (isPlatformServer(this.platformId)) return;
    this.userObservable.subscribe((user) => this.handleUserChange(user));
    const user = this.userService.getCurrentData();
    if (!user) return this.connectUser();
    this.userObservable.next(user);
  }

  private connectUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['access']);
      return;
    }
    this.isLoading = true;
    this.userService.decodeToken(token).subscribe({
      next: (user: User) => {
        this.userObservable.next(user);
        this.userService.updateData(user);
      },
      error: () => this.router.navigate(['access']),
      complete: () => (this.isLoading = false),
    });
  }

  private handleUserChange(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.connectToWebSocket();
    this.findGroups(user._id);
  }

  public ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
  }

  connectToWebSocket() {
    this.socket = this.webSocketService.connect();
  }

  findGroups(user: string) {
    this.groupService.findAllWithParticipants(user).subscribe({
      next: (result) => (this.currentGroups = result),
      complete: () => (this.isLoading = false),
    });
  }

  changeSelect(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    const group = this.currentGroups.find((g) => g._id == selectElement.value);
    if (!group) return;
    this.socket.on(`vote-${group._id}`, (payload) =>
      this.changeTable(payload.participant)
    );
    this.selectedGroup = group;
    this.groupService.getResult(group._id).subscribe({
      next: (result) => (this.voteResult = result),
    });
  }

  changeTable(participant: string) {
    const index = this.voteResult.participants.findIndex(
      (p) => p._id == participant
    );
    if (index >= 0) this.voteResult.participants[index].votes += 1;
    this.voteResult.participants.sort((a, b) => b.votes - a.votes);
  }

  allowVote() {
    this.socket.emit('allow-vote', this.urn);
  }
}

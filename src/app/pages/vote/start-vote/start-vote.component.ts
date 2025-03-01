import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { WebSocketService } from '../../../shared/services/websocket.service';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { User } from '../../../shared/models/user';
import { Group } from '../../../shared/models/group';
import { GroupService } from '../../../shared/services/group.service';
import { VoteService } from './../../../shared/services/vote.service';
import { ParticipantService } from '../../../shared/services/participant.service';
import { UserService } from '../../../shared/services/user.service';
import { Participant } from '../../../shared/models/participant';
import { Router } from '@angular/router';
import { VoteStatus } from '../../../shared/types/vote-status.type';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Socket } from 'socket.io-client';
import { FormsModule } from '@angular/forms';
import { CreateVoteDto } from '../../../shared/dto/vote/create-vote.dto';
import { AccessInputComponent } from '../../../shared/components/inputs/access-input/access-input.component';
import { ModalComponent } from '../../../shared/components/modals/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-start-vote',
  imports: [
    LoadingComponent,
    HeaderComponent,
    AccessInputComponent,
    ModalComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './start-vote.component.html',
  styleUrl: './start-vote.component.scss',
})
export class StartVoteComponent implements OnInit, OnDestroy {
  public isLoading: boolean = true;
  public currentUser: User | null = null;
  public currentGroups: Group[] = [];

  public selectedGroups: Group[] = [];
  public selectedParticipants: Participant[][] = [];

  public simpleId: string = '';
  public status: VoteStatus = 'selecting';
  public quantity: number = 0;

  public votes: CreateVoteDto[] = [];

  public modalConfig = {
    isVisible: false,
    title: '',
    children: '',
    onClose: () => {},
  };

  private socket!: Socket;

  private userObservable = new BehaviorSubject<User | null>(null);

  private platformId = inject(PLATFORM_ID);
  private webSocketService = inject(WebSocketService);
  private userService = inject(UserService);
  private voteService = inject(VoteService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private router = inject(Router);

  @HostListener('document:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'F11' || event.key == 'F4' || event.key == 'Tab')
      event.preventDefault();
  }

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

  private connectToWebSocket() {
    this.socket = this.webSocketService.connect();
    this.socket.on('new-id', (payload) => (this.simpleId = payload));
    this.socket.on('vote-allowed', () => {
      if (this.status == 'blocked') this.status = 'occurring';
    });
  }

  private findGroups(user: string) {
    this.groupService.findAllWithParticipants(user).subscribe({
      next: (result) => (this.currentGroups = result),
      complete: () => (this.isLoading = false),
    });
  }

  private findParticipants(position: 0 | 1, group: string) {
    this.participantService.findAllByGroup(group).subscribe({
      next: (result) => (this.selectedParticipants[position] = result),
    });
  }

  public changeSelect(e: Event, position: 0 | 1) {
    const selectElement = e.target as HTMLSelectElement;
    const group = this.currentGroups.find((g) => g._id == selectElement.value);
    if (!group) return;
    this.selectedGroups[position] = group;
    this.findParticipants(position, this.selectedGroups[position]._id);
  }

  public startVote() {
    if (!this.selectedGroups[0] && !this.selectedGroups[1]) {
      this.modalConfig.children = 'SELECIONE PELO MENOS UM GRUPO';
      this.modalConfig.onClose = () => (this.modalConfig.isVisible = false);
      this.modalConfig.isVisible = true;
      return;
    }
    if (this.quantity <= 0) {
      this.modalConfig.children = 'QUANTIDADE DE VOTOS INVÁLIDA';
      this.modalConfig.onClose = () => (this.modalConfig.isVisible = false);
      this.modalConfig.isVisible = true;
      return;
    }
    this.status = 'occurring';
  }

  public addVote(position: 0 | 1, participant: string) {
    this.votes[position] = { participant };
  }

  public vote() {
    for (let i = 0; i < this.votes.length; i++) {
      this.socket.emit(`send-vote`, {
        ...this.votes[i],
        group: this.selectedGroups[i]._id,
      });
      if (this.votes[i].participant != 'null')
        this.voteService.create(this.votes[i]).subscribe();
    }
    this.quantity -= 1;
    this.status = this.quantity > 0 ? 'blocked' : 'ended';
  }

  public logOut() {
    localStorage.removeItem('token');
    this.userService.updateData(null);
    this.router.navigate(['access']);
  }
}

import { ParticipantService } from '../../../shared/services/participant.service';
import { GroupService } from '../../../shared/services/group.service';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Group } from '../../../shared/models/group';
import { User } from '../../../shared/models/user';
import { UserService } from '../../../shared/services/user.service';
import { isPlatformServer } from '@angular/common';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Participant } from '../../../shared/models/participant';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ListComponent } from '../../../shared/components/list/list.component';

@Component({
  selector: 'app-find-group',
  imports: [HeaderComponent, ListComponent, LoadingComponent],
  templateUrl: './find-group.component.html',
  styleUrls: ['./find-group.component.scss'],
})
export class FindGroupComponent implements OnInit {
  public token: string = '';
  public id: string = '';
  public type: string = '';

  public currentUser: User | null = null;
  public currentGroup: Group | null = null;

  public allElements: (Group | Participant)[][] = [];
  public navigate: (path: string) => void = () => {};
  public delete: (id: string) => void = this.deleteSubGroup;
  public findNext: (page: number) => Observable<(Group | Participant)[]> =
    this.findNextSubGroups;

  public isLoading: boolean = true;

  private userObservable = new BehaviorSubject<User | null>(null);

  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    this.token = this.route.snapshot.paramMap.get('token') as string;
    this.findAllData();
    if (isPlatformServer(this.platformId)) return;
    this.userObservable.subscribe((user) => this.handleUserChange(user));
    const user = this.userService.getCurrentData();
    if (!user) return this.connectUser();
    this.userObservable.next(user);
  }

  public findNextSubGroups(page: number) {
    return this.groupService.findManyByGroup(this.id, this.token, page);
  }

  public navigateToGroup(id: string) {
    this.router.navigate([`/group/${this.token}/${id}`]).then(() => {
      this.id = id;
      this.findAllData();
    });
  }

  public deleteSubGroup(id: string) {
    this.groupService.delete(id).subscribe();
  }

  public findNextParticipants(page: number) {
    return this.participantService.findManyByGroup(this.id, this.token, page);
  }

  public deleteParticipant(id: string) {
    this.participantService.delete(id).subscribe();
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
  }

  private findAllData() {
    this.findGroup();
    this.findSubGroups();
  }

  private findGroup() {
    this.groupService.findById(this.id, this.token).subscribe({
      next: (result) => (this.currentGroup = result),
    });
  }

  private findSubGroups() {
    forkJoin([
      this.groupService.findManyByGroup(this.id, this.token, 0),
      this.groupService.findManyByGroup(this.id, this.token, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allElements[0] = firstPage;
        this.allElements[1] = secondPage;

        if (firstPage.length == 0 && secondPage.length == 0) {
          this.findParticipants();
        } else {
          this.type = 'grupo';
          this.findNext = this.findNextSubGroups;
          this.navigate = this.navigateToGroup;
        }
        this.isLoading = false;
      },
    });
  }

  private findParticipants() {
    forkJoin([
      this.participantService.findManyByGroup(this.id, this.token, 0),
      this.participantService.findManyByGroup(this.id, this.token, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allElements[0] = firstPage;
        this.allElements[1] = secondPage;
        if (firstPage.length > 0) this.type = 'participante';
        this.findNext = this.findNextParticipants;
        this.delete = this.deleteParticipant;
      },
    });
  }
}

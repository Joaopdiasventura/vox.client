import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Group } from '../../../core/models/group';
import { User } from '../../../core/models/user';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Participant } from '../../../core/models/participant';
import { Observable, forkJoin } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ListComponent } from '../../../shared/components/list/list.component';
import { GroupService } from '../../../core/services/group.service';
import { ParticipantService } from '../../../core/services/participant.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-find-group',
  imports: [HeaderComponent, ListComponent, LoadingComponent],
  templateUrl: './find-group.component.html',
  styleUrls: ['./find-group.component.scss'],
})
export class FindGroupComponent implements OnInit {
  public id: string = '';
  public type: string = '';

  public currentUser: User | null = null;
  public currentGroup: Group | null = null;

  public allElements: (Group | Participant)[][] = [];
  public navigate: (path: string) => void = () => {};
  public delete: (id: string) => void = this.deleteSubGroup;
  public findNext: (page: number) => Observable<(Group | Participant)[]> =
    this.findNextSubGroups;

  public isLoading: boolean = false;

  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public ngOnInit(): void {
    const user = this.userService.getCurrentData();
    this.handleUserChange(user);
  }

  public findNextSubGroups(page: number) {
    return this.groupService.findManyByGroup(this.id, page);
  }

  public navigateToGroup(id: string) {
    this.router.navigate(['group', id]).then(() => {
      this.id = id;
      this.findAllData();
    });
  }

  public deleteSubGroup(id: string) {
    this.groupService.delete(id).subscribe();
  }

  public findNextParticipants(page: number) {
    return this.participantService.findManyByGroup(this.id, page);
  }

  public deleteParticipant(id: string) {
    this.participantService.delete(id).subscribe();
  }

  private handleUserChange(user: User | null) {
    this.currentUser = user;
    this.id = this.route.snapshot.paramMap.get('id') as string;
    this.findAllData();
  }

  private findAllData() {
    this.findGroup();
    this.findSubGroups();
  }

  private findGroup() {
    this.isLoading = true;
    this.groupService.findById(this.id).subscribe({
      next: (result) => (this.currentGroup = result),
      complete: () => (this.isLoading = false),
    });
  }

  private findSubGroups() {
    this.isLoading = true;
    forkJoin([
      this.groupService.findManyByGroup(this.id, 0),
      this.groupService.findManyByGroup(this.id, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allElements[0] = firstPage;
        this.allElements[1] = secondPage;
        if (firstPage.length == 0 && secondPage.length == 0)
          this.findParticipants();
        else {
          this.type = 'grupo';
          this.findNext = this.findNextSubGroups;
          this.navigate = this.navigateToGroup;
        }
      },
      complete: () => (this.isLoading = false),
    });
  }

  private findParticipants() {
    this.isLoading = true;
    forkJoin([
      this.participantService.findManyByGroup(this.id, 0),
      this.participantService.findManyByGroup(this.id, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allElements[0] = firstPage;
        this.allElements[1] = secondPage;
        if (firstPage.length > 0) this.type = 'participante';
        this.findNext = this.findNextParticipants;
        this.delete = this.deleteParticipant;
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }
}

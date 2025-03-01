import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { User } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { GroupService } from '../../shared/services/group.service';
import { Group } from '../../shared/models/group';
import { ListComponent } from '../../shared/components/list/list.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-index',
  imports: [LoadingComponent, HeaderComponent, ListComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit {
  public currentUser: User | null = null;

  public allGroups: Group[][] = [];

  public isLoading: boolean = true;
  public isMenuOpen: boolean = false;

  private userObservable = new BehaviorSubject<User | null>(null);

  private platformId = inject(PLATFORM_ID);
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

  public findNextGroups(page: number): Observable<Group[]> {
    return this.groupService.findManyByUser(this.currentUser?._id || '', page);
  }

  public deleteGroup(id: string) {
    this.groupService.delete(id).subscribe();
  }

  public navigate(path: string) {
    this.router.navigate([path]);
  }

  public viewGroupDetails(id: string) {
    const token = localStorage.getItem('token');
    this.router.navigate(['group', token, id]);
  }

  public logOut() {
    localStorage.removeItem('token');
    this.userService.updateData(null);
    this.router.navigate(['access']);
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
    this.findFirstsGroups(user._id);
  }

  private findFirstsGroups(user: string) {
    this.isLoading = true;
    this.groupService.findManyByUser(user, 0).subscribe({
      next: (result) => {
        this.allGroups[0] = result;
        this.allGroups.push(result);
      },
    });
    this.groupService.findManyByUser(user, 1).subscribe({
      next: (result) => {
        this.allGroups[1] = result;
        this.allGroups.push(result);
      },
      complete: () => (this.isLoading = false),
    });
    this.isLoading = false;
  }
}

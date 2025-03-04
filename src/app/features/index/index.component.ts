import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../core/models/user';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Group } from '../../core/models/group';
import { ListComponent } from '../../shared/components/list/list.component';
import { forkJoin, Observable } from 'rxjs';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { GroupService } from '../../core/services/group.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-index',
  imports: [LoadingComponent, HeaderComponent, ListComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit {
  public currentUser: User | null = null;

  public allGroups: Group[][] = [];

  public isLoading: boolean = false;
  public isMenuOpen: boolean = false;

  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  public ngOnInit(): void {
    const user = this.userService.getCurrentData();
    this.handleUserChange(user);
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
    this.router.navigate(['group', id]);
  }

  public logOut() {
    localStorage.removeItem('token');
    this.userService.updateData(null);
    this.router.navigate(['access']);
  }

  private handleUserChange(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.findFirstsGroups(user._id);
  }

  private findFirstsGroups(user: string) {
    this.isLoading = true;
    forkJoin([
      this.groupService.findManyByUser(user, 0),
      this.groupService.findManyByUser(user, 1),
    ]).subscribe({
      next: ([firstPage, secondPage]) => {
        this.allGroups[0] = firstPage;
        this.allGroups[1] = secondPage;
        this.isLoading = false;
      },
    });
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowVoteComponent } from './follow-vote.component';

describe('FollowVoteComponent', () => {
  let component: FollowVoteComponent;
  let fixture: ComponentFixture<FollowVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowVoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

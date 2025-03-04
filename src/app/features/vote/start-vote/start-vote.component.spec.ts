import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartVoteComponent } from './start-vote.component';

describe('StartVoteComponent', () => {
  let component: StartVoteComponent;
  let fixture: ComponentFixture<StartVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartVoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

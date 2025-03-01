import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessInputComponent } from './access-input.component';

describe('AccessInputComponent', () => {
  let component: AccessInputComponent;
  let fixture: ComponentFixture<AccessInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

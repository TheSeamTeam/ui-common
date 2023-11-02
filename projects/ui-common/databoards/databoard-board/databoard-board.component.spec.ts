import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataboardBoardComponent } from './databoard-board.component';

describe('DataboardComponent', () => {
  let component: DataboardBoardComponent;
  let fixture: ComponentFixture<DataboardBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataboardBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataboardBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

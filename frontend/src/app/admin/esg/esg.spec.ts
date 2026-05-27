import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Esg } from './esg';

describe('Esg', () => {
  let component: Esg;
  let fixture: ComponentFixture<Esg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Esg],
    }).compileComponents();

    fixture = TestBed.createComponent(Esg);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

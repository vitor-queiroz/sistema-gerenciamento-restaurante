import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cardapiopublic } from './cardapiopublic';

describe('Cardapiopublic', () => {
  let component: Cardapiopublic;
  let fixture: ComponentFixture<Cardapiopublic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cardapiopublic],
    }).compileComponents();

    fixture = TestBed.createComponent(Cardapiopublic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

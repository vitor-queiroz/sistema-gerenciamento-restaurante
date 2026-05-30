import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Acessos } from './acessos';

describe('Acessos', () => {
  let component: Acessos;
  let fixture: ComponentFixture<Acessos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Acessos],
    }).compileComponents();

    fixture = TestBed.createComponent(Acessos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

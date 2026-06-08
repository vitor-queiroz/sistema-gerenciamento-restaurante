import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteLogin } from './cliente-login';

describe('ClienteLogin', () => {
  let component: ClienteLogin;
  let fixture: ComponentFixture<ClienteLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
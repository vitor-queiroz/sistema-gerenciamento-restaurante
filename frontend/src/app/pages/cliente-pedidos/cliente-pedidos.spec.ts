import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientePedidos } from './cliente-pedidos';

describe('ClientePedidos', () => {
  let component: ClientePedidos;
  let fixture: ComponentFixture<ClientePedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientePedidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientePedidos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
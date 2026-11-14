import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ActiviteClientComponent } from './activite-client.component';

describe('ActiviteClientComponent', () => {
  let component: ActiviteClientComponent;
  let fixture: ComponentFixture<ActiviteClientComponent>;

  beforeEach(async () => {
    localStorage.setItem('token', 'test-token');
    await TestBed.configureTestingModule({
      imports: [ActiviteClientComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiviteClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('token'));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

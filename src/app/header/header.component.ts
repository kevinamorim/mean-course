import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  userIsAuthenticated = false;
  private authStatusListenerObs: Subscription;  

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authStatusListenerObs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });

  }

  ngOnDestroy(): void {
    this.authStatusListenerObs.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }

}

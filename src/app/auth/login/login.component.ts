import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    private authStatusSub: Subscription;

    isLoading = false;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.authStatusSub = this.authService.getAuthStatusListener()
            .subscribe(() => {
                this.isLoading = false;
            });
    }

    ngOnDestroy(): void {
        this.authStatusSub.unsubscribe();
    }

    onLogin(loginForm: NgForm) {
        if (loginForm.invalid) {
            return;
        }
        
        this.isLoading = true;
        this.authService.login(loginForm.value['email'], loginForm.value['password']);
    }

}
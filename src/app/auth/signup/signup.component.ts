import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

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

    onSignup(signupForm: NgForm) {

        if (signupForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.authService.createUser(signupForm.value['email'], signupForm.value['password']);
    }

}
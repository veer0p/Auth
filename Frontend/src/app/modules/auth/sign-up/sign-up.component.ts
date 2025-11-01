import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signUpForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    // Custom password validator
                    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
                ],
            ],
            firstname: [''],
            lastname: [''],
            agreements: ['', Validators.requiredTrue],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        // Do nothing if the form is invalid
        if (this.signUpForm.invalid) {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Prepare sign up data
        const formValue = this.signUpForm.value;
        // Generate username from email if not provided (backend will handle this)
        const username = formValue.email.split('@')[0] + '_' + Date.now().toString().slice(-6);
        const signUpData = {
            username: username,
            email: formValue.email,
            password: formValue.password,
            firstname: formValue.firstname || undefined,
            lastname: formValue.lastname || undefined,
        };

        // Sign up
        this._authService.signUp(signUpData).subscribe({
            next: (response) => {
                // Navigate to confirmation required page
                // You can also navigate to sign-in with a success message
                this._router.navigateByUrl('/confirmation-required');
            },
            error: (error) => {
                // Re-enable the form
                this.signUpForm.enable();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: typeof error === 'string' ? error : 'Something went wrong, please try again.',
                };

                // Show the alert
                this.showAlert = true;
            },
        });
    }

    /**
     * Sign up with Google
     */
    signUpWithGoogle(): void {
        // For demo purposes, we'll use mock Google data
        const mockGoogleData = {
            google_id: 'google_' + Date.now().toString(),
            email: 'user@gmail.com',
            name: 'Google User',
        };

        this.signUpForm.disable();
        this.showAlert = false;

        this._authService.signInWithGoogle(mockGoogleData).subscribe({
            next: () => {
                this._router.navigateByUrl('/signed-in-redirect');
            },
            error: (error) => {
                this.signUpForm.enable();
                this.alert = {
                    type: 'error',
                    message: typeof error === 'string' ? error : 'Google sign up failed',
                };
                this.showAlert = true;
            },
        });
    }

    /**
     * Sign up with Meta/Facebook
     */
    signUpWithMeta(): void {
        // For demo purposes, we'll use mock Meta data
        const mockMetaData = {
            meta_id: 'meta_' + Date.now().toString(),
            email: 'user@facebook.com',
            name: 'Meta User',
        };

        this.signUpForm.disable();
        this.showAlert = false;

        this._authService.signInWithMeta(mockMetaData).subscribe({
            next: () => {
                this._router.navigateByUrl('/signed-in-redirect');
            },
            error: (error) => {
                this.signUpForm.enable();
                this.alert = {
                    type: 'error',
                    message: typeof error === 'string' ? error : 'Meta sign up failed',
                };
                this.showAlert = true;
            },
        });
    }
}

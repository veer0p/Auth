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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
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
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
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
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberMe: [''],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn({
            email: this.signInForm.get('email').value,
            password: this.signInForm.get('password').value,
        }).subscribe({
            next: () => {
                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) || '/signed-in-redirect';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            error: (error) => {
                // Re-enable the form
                this.signInForm.enable();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: typeof error === 'string' ? error : 'Wrong email or password',
                };

                // Show the alert
                this.showAlert = true;
            }
        });
    }

    /**
     * Sign in with Google
     */
    signInWithGoogle(): void {
        // For demo purposes, we'll use mock Google data
        // In production, integrate with Google OAuth
        const mockGoogleData = {
            google_id: 'google_' + Date.now().toString(),
            email: 'user@gmail.com',
            name: 'Google User',
        };

        // Show loading
        this.signInForm.disable();
        this.showAlert = false;

        this._authService.signInWithGoogle(mockGoogleData).subscribe({
            next: () => {
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) || '/signed-in-redirect';
                this._router.navigateByUrl(redirectURL);
            },
            error: (error) => {
                this.signInForm.enable();
                this.alert = {
                    type: 'error',
                    message: typeof error === 'string' ? error : 'Google sign in failed',
                };
                this.showAlert = true;
            }
        });
    }

    /**
     * Sign in with Meta/Facebook
     */
    signInWithMeta(): void {
        // For demo purposes, we'll use mock Meta data
        // In production, integrate with Meta OAuth
        const mockMetaData = {
            meta_id: 'meta_' + Date.now().toString(),
            email: 'user@facebook.com',
            name: 'Meta User',
        };

        // Show loading
        this.signInForm.disable();
        this.showAlert = false;

        this._authService.signInWithMeta(mockMetaData).subscribe({
            next: () => {
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) || '/signed-in-redirect';
                this._router.navigateByUrl(redirectURL);
            },
            error: (error) => {
                this.signInForm.enable();
                this.alert = {
                    type: 'error',
                    message: typeof error === 'string' ? error : 'Meta sign in failed',
                };
                this.showAlert = true;
            }
        });
    }
}

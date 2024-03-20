import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signUpForm: FormGroup;
    showAlert: boolean = false;



    userForm: FormGroup;
    vendorForm: FormGroup;
    isAddLoader: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _toastr: ToastrService,
        private _userService: UsersService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.userForm = new FormGroup({
            name: new FormControl('', Validators.required),
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            username: new FormControl('', Validators.required),
            role: new FormControl('vendor', Validators.required),
            user: new FormControl(true),
        });
        this.vendorForm = new FormGroup({
            vendorname: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            commission_rate: new FormControl(5, Validators.required),
            is_active: new FormControl(true),
        });
    }

    addNewUser() {
        const { name, email, password, username, role, user } = this.userForm.getRawValue();
        if (name == '' || email == '' || password == '' || username == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        const { vendorname, description, commission_rate, is_active } = this.vendorForm.getRawValue();
        let vendor = { name: vendorname, description, commission_rate, is_active };
        this.isAddLoader = true;
        let payload = { name, email, password, username, role, user, vendor, email_link: 'https://tcgbargain.web.app/emailVerification/' + email };
        this._userService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.showToast('Registered Successfully, and please verify your email.', 'Register', 'success');
            this.isAddLoader = false;
            this._router.navigate(['sign-in']);
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isAddLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
        })
    }
    showToast(msg, title, type) {
        if (type == 'error') {
            this._toastr.error(msg, title);
        } else if (type == 'success') {
            this._toastr.success(msg, title);
        }
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

        // Sign up
        this._authService.signUp(this.signUpForm.value)
            .subscribe(
                (response) => {

                    // Navigate to the confirmation required page
                    this._router.navigateByUrl('/confirmation-required');
                },
                (response) => {

                    // Re-enable the form
                    this.signUpForm.enable();

                    // Reset the form
                    this.signUpNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: 'Something went wrong, please try again.'
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }
}

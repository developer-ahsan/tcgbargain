import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UsersService } from '../../users.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'store-information-list',
    templateUrl: './information.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class UserInfoListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userForm: FormGroup;
    vendorForm: FormGroup;
    isPasswordLoader: boolean = false;
    isEditLoader: boolean = false;
    slectedUser: any;
    new_password: any;
    user: any;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _toastr: ToastrService,
        private _authService: AuthService,
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
        this.initForm();
        this.getSelectedUser();
        this._authService.user$.subscribe(res => {
            this.user = res["data"][0];
        })
    }
    initForm() {
        this.userForm = new FormGroup({
            id: new FormControl('', Validators.required),
            name: new FormControl('', Validators.required),
            email: new FormControl('', Validators.required),
            // password: new FormControl(null, Validators.required),
            username: new FormControl('', Validators.required),
            role: new FormControl('', Validators.required)
        });
        this.vendorForm = new FormGroup({
            vendorid: new FormControl(null),
            vendorname: new FormControl('', Validators.required),
            description: new FormControl(''),
            commission_rate: new FormControl('', Validators.required),
            slug: new FormControl('', Validators.required),
            is_active: new FormControl(true),
        });
    }
    getSelectedUser() {
        this._userService.User$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.slectedUser = res["data"][0];
            this.userForm.patchValue(this.slectedUser);
            if (this.slectedUser.vendor.id) {
                const { id, description, name, commision_rate, slug } = this.slectedUser.vendor;
                this.vendorForm.patchValue({
                    vendorid: id,
                    vendorname: name,
                    description: description,
                    commission_rate: commision_rate,
                    slug: slug,
                    is_active: true
                });
            }
        });
    }
    showToast(msg, title, type) {
        if (type == 'error') {
            this._toastr.error(msg, title);
        } else if (type == 'success') {
            this._toastr.success(msg, title);
        }
    }
    updateUser() {
        const { id, name, email, username, role } = this.userForm.getRawValue();
        if (name == '' || email == '' || username == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        const { vendorid, vendorname, description, commission_rate, slug, is_active } = this.vendorForm.getRawValue();
        let vendor = { id: vendorid, name: vendorname, description, commission_rate, slug, is_active };
        this.isEditLoader = true;
        let payload = { id, name, email, username, role, user: true, vendor };
        this._userService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Updated', 'success');
                this._userService.getUserById(id).subscribe();
            }
            this.isEditLoader = false;
            this._changeDetectorRef.markForCheck();

        }, err => {
            console.log(err)
            this.isEditLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"] || err.error["detail"], err.error["code"], 'error');
        })
    }
    updatePassword() {
        const { id, name, email, username, role } = this.userForm.getRawValue();
        if (!this.new_password) {
            this.showToast('Password is required', 'Required', 'error');
            return;
        }
        this.isPasswordLoader = true;
        let payload = { password: this.new_password, change_password: true, id };
        this._userService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Updated', 'success');
                this.new_password = '';
            }
            this.isPasswordLoader = false;
            this._changeDetectorRef.markForCheck();

        }, err => {
            console.log(err)
            this.isPasswordLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"] || err.error["detail"], err.error["code"], 'error');
        })
    }
    /**
 * On destroy
 */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
}

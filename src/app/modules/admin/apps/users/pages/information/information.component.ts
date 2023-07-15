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
    isEditLoader: boolean = false;
    slectedUser: any;
    constructor(
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
        this.initForm();
        this.getSelectedUser();
    }
    initForm() {
        this.userForm = new FormGroup({
            id: new FormControl('', Validators.required),
            name: new FormControl('', Validators.required),
            email: new FormControl('', Validators.required),
            password: new FormControl(null, Validators.required),
            username: new FormControl('', Validators.required),
            role: new FormControl('', Validators.required)
        });
    }
    getSelectedUser() {
        this._userService.User$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.slectedUser = res["data"][0];
            this.userForm.patchValue(this.slectedUser);
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
        const { id, name, email, password, username, role } = this.userForm.getRawValue();
        if (name == '' || email == '' || username == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isEditLoader = true;
        let payload = { id, name, email, password, username, role, user: true };
        this._userService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Updated', 'success');
            }
            this.isEditLoader = false;
            this._changeDetectorRef.markForCheck();

        }, err => {
            this.isEditLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
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

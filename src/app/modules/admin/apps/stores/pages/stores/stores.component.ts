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
import { StoresService } from '../../stores.service';

@Component({
    selector: 'stores-list',
    templateUrl: './stores.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class UsersStoresListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['name', 'email', 'username', 'role', 'created_at', 'action'];
    totalUsers: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Current Store';
    userForm: FormGroup;
    isAddLoader: boolean = false;
    editUserForm: FormGroup;
    isEditBoolean: boolean = false;
    isEditLoader: boolean = false;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _toastr: ToastrService,
        private _userService: StoresService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.dataSource.push({ da: 1 })
        this.isLoading = true;
        this.initForm();
        this.getUsersList(1, '', 'get');
    }
    initForm() {
        this.userForm = new FormGroup({
            name: new FormControl('', Validators.required),
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            username: new FormControl('', Validators.required),
            role: new FormControl('admin', Validators.required),
            user: new FormControl(true),
        });
        this.editUserForm = new FormGroup({
            id: new FormControl('', Validators.required),
            name: new FormControl('', Validators.required),
            email: new FormControl('', Validators.required),
            password: new FormControl(null, Validators.required),
            username: new FormControl('', Validators.required),
            role: new FormControl('', Validators.required)
        });
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getUsersList(page, msg, type) {
        let params = {
            list: true,
            sort_by: 'email',
            sort_order: 'ASC',
            keyword: this.keyword,
            page: page,
            size: 20
        }
        this._userService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.dataSource = res["data"];
            this.totalUsers = res["totalRecords"];
            if (this.keyword == '') {
                this.tempDataSource = res["data"];
                this.tempRecords = res["totalRecords"];
            }
            if (type == 'add') {
                this.showToast(msg, 'Created', 'success');
                this.userForm.reset();
                this.initForm();
                this.mainScreen = 'Current Users';
                this.isAddLoader = false;
                this._changeDetectorRef.markForCheck();
            }
            if (type == 'edit') {
                this.showToast(msg, 'Updated', 'success');
                this.isEditLoader = false;
                this._changeDetectorRef.markForCheck();
            }
            this.isLoading = false;
            this.isSearching = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isSearching = false;
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    getNextData(event) {
        const { previousPageIndex, pageIndex } = event;

        if (pageIndex > previousPageIndex) {
            this.page++;
        } else {
            this.page--;
        };
        this.getUsersList(this.page, '', 'get');
    };

    searchUser(value) {
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
        this.getUsersList(1, '', 'get');
    }
    resetSearch() {
        this.keyword = '';
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.dataSource = this.tempDataSource;
        this.totalUsers = this.tempRecords;
        this._changeDetectorRef.markForCheck();
    }
    addNewUser() {
        const { name, email, password, username, role, user } = this.userForm.getRawValue();
        if (name == '' || email == '' || password == '' || username == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isAddLoader = true;
        let payload = { name, email, password, username, role, user };
        this._userService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getUsersList(1, res["message"], 'add');
            } else {
                this.isAddLoader = false;
                this._changeDetectorRef.markForCheck();
            }

        }, err => {
            console.log(err)
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
    deleteUser(user) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete user',
            message: 'Are you sure you want to delete this user? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                user.delLoader = true;
                this.deleteUserApi(user);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    deleteUserApi(user) {
        let payload = {
            id: user.id,
            user: true
        }
        this._userService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Deleted', 'success');
                this.dataSource = this.dataSource.filter(u => u.id != user.id);
                this.totalUsers--;
                this._changeDetectorRef.markForCheck();
            } else {
                user.delLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            user.delLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
        })
    }
    editUser(user) {
        this.isEditBoolean = true;
        this.editUserForm.patchValue(user);
    }
    updateUser() {
        const { id, name, email, password, username, role } = this.editUserForm.getRawValue();
        if (name == '' || email == '' || username == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isEditLoader = true;
        let payload = { id, name, email, password, username, role, user: true };
        this._userService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getUsersList(1, res["message"], 'edit');
            } else {
                this.isEditLoader = false;
                this._changeDetectorRef.markForCheck();
            }

        }, err => {
            this.isEditLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
        })
    }
    backToList() {
        this.isEditBoolean = false;
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

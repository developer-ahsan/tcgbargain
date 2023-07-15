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
    selector: 'addresses-list',
    templateUrl: './addresses.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class UsersAddressesListComponent implements OnInit, OnDestroy {
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
    mainScreen: string = 'Current Address';
    addressForm: FormGroup;
    isAddLoader: boolean = false;
    editAddressForm: FormGroup;
    isEditBoolean: boolean = false;
    isEditLoader: boolean = false;
    selectedUser: any;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _toastr: ToastrService,
        private _userService: UsersService,
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
        this.getSelectedUser();
        this.initForm();
        this.getAddressList(1, '', 'get');
    }
    getSelectedUser() {
        this._userService.User$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.selectedUser = res["data"][0];
            console.log(res);
        });
    }
    initForm() {
        this.addressForm = new FormGroup({
            street: new FormControl('', Validators.required),
            city: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            country: new FormControl('', Validators.required),
            phone_number: new FormControl('', Validators.required),
            postal_code: new FormControl('', Validators.required),
            address: new FormControl(true),
        });
        this.editAddressForm = new FormGroup({
            id: new FormControl('', Validators.required),
            street: new FormControl('', Validators.required),
            city: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            country: new FormControl('', Validators.required),
            phone_number: new FormControl('', Validators.required),
            postal_code: new FormControl('', Validators.required),
            address: new FormControl(true),
        });
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getAddressList(page, msg, type) {
        let params = {
            address: true,
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
                this.addressForm.reset();
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
            this.isAddLoader = false;
            this.isEditLoader = false;
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
        this.getAddressList(this.page, '', 'get');
    };

    searchUser(value) {
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
        this.getAddressList(1, '', 'get');
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
    addNewAddress() {
        const { street, city, state, country, phone_number, postal_code, address } = this.addressForm.getRawValue();
        if (city == '' || country == '' || phone_number == '' || postal_code == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isAddLoader = true;
        let payload = { user_id: this.selectedUser.id, street, city, state, country, phone_number, postal_code, address };
        this._userService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getAddressList(1, res["message"], 'add');
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
    editUser(address) {
        this.isEditBoolean = true;
        this.editAddressForm.patchValue(address);
    }
    updateAddress() {
        const { street, city, state, country, phone_number, postal_code, address, id } = this.editAddressForm.getRawValue();
        if (city == '' || country == '' || phone_number == '' || postal_code == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isEditLoader = true;
        let payload = { street, city, state, country, phone_number, postal_code, address, id, user_id: this.selectedUser.id };
        this._userService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getAddressList(1, res["message"], 'edit');
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

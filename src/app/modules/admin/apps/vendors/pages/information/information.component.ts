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
import { VendorsService } from '../../vendors.service';

@Component({
    selector: 'store-information-list',
    templateUrl: './information.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorInfoListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    vendorForm: FormGroup;
    isEditLoader: boolean = false;
    slectedVendor: any;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _toastr: ToastrService,
        private _vendorService: VendorsService,
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
        this.getSelectedVendor();
    }
    initForm() {
        this.vendorForm = new FormGroup({
            id: new FormControl(0, Validators.required),
            name: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            commission_rate: new FormControl('', Validators.required),
            slug: new FormControl('', Validators.required),
            is_active: new FormControl(true),
            vendor: new FormControl(true),
        });
    }
    getSelectedVendor() {
        this._vendorService.Vendor$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.slectedVendor = res["data"][0];
            this.vendorForm.patchValue(this.slectedVendor);
        });
    }
    showToast(msg, title, type) {
        if (type == 'error') {
            this._toastr.error(msg, title);
        } else if (type == 'success') {
            this._toastr.success(msg, title);
        }
    }
    updateVendor() {
        const { id, name, description, commission_rate, slug, is_active, vendor } = this.vendorForm.getRawValue();
        if (name == '' || commission_rate == '' || slug == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isEditLoader = true;
        let payload = { id, name, description, commission_rate, slug, is_active, vendor };
        this._vendorService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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

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
    selector: 'store-information-list',
    templateUrl: './information.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class StoreInfoListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    storeForm: FormGroup;
    isEditLoader: boolean = false;
    slectedStore: any;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _toastr: ToastrService,
        private _storeService: StoresService,
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
        this.getSelectedStore();
    }
    initForm() {
        this.storeForm = new FormGroup({
            id: new FormControl(0, Validators.required),
            title: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            url: new FormControl('', Validators.required),
            primary_color: new FormControl('#00000', Validators.required),
            vendor_id: new FormControl(null),
            secondary_color: new FormControl('#FFFFF', Validators.required),
            is_active: new FormControl(true),
            store: new FormControl(true),
        });
    }
    getSelectedStore() {
        this._storeService.Store$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.slectedStore = res["data"][0];
            this.storeForm.patchValue(this.slectedStore);
        });
    }
    showToast(msg, title, type) {
        if (type == 'error') {
            this._toastr.error(msg, title);
        } else if (type == 'success') {
            this._toastr.success(msg, title);
        }
    }
    updateStore() {
        const { id, title, url, description, primary_color, secondary_color, is_active, store, vendor_id } = this.storeForm.getRawValue();
        if (title == '' || url == '' || description == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isEditLoader = true;
        let payload = { id: Number(id), title, url, description, primary_color, secondary_color, is_active, store, vendor_id };
        this._storeService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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

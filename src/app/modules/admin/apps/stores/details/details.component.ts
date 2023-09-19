import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawer, MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { assign } from 'lodash-es';
import * as moment from 'moment';
import { Tag, Task } from 'app/modules/admin/apps/tasks/tasks.types';
import { TasksListComponent } from 'app/modules/admin/apps/tasks/list/list.component';
import { TasksService } from 'app/modules/admin/apps/tasks/tasks.service';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseComponentsComponent } from 'app/modules/admin/ui/fuse-components/fuse-components.component';
import { StoresService } from '../stores.service';

@Component({
    selector: 'tasks-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoresDetailsComponents implements OnInit, AfterViewInit, OnDestroy {
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    routes = [];
    selectedScreeen = '';
    selectedRoute = '';

    // Sidebar stuff
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    @ViewChild("panel") panel;
    @ViewChild('topScrollAnchor') topScroll: ElementRef;
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    menuData: any;
    slectedStore: any;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private route: ActivatedRoute,
        private _storeService: StoresService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.getSelectedStore();
        this._router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.selectedScreeen = this.route.children[0].snapshot.data.title;
                this.selectedRoute = this.route.children[0].snapshot.data.url;
            }
        })
        this.selectedScreeen = this.route.children[0].snapshot.data.title;
        this.selectedRoute = this.route.children[0].snapshot.data.url;
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('md')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
            });
    }
    getSelectedStore() {
        this._storeService.Store$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.slectedStore = res["data"][0];
            this.routesInitialize();
        });
    }
    routesInitialize() {
        this.menuData = [
            {
                id: 'store',
                title: 'Store Details',
                type: 'group',
                children: [
                    {
                        id: 'store.address',
                        title: 'Store Information',
                        icon: 'mat_outline:info',
                        type: 'basic',
                        link: `/apps/stores/${this.slectedStore.id}/information`
                    },
                    {
                        id: 'store.products',
                        title: 'Store Products',
                        icon: 'mat_outline:category',
                        type: 'basic',
                        link: `/apps/stores/${this.slectedStore.id}/store-products`
                    },
                    {
                        id: 'store.sliders',
                        title: 'Store Sliders',
                        icon: 'mat_outline:image',
                        type: 'basic',
                        link: `/apps/stores/${this.slectedStore.id}/store-sliders`
                    }
                ]
            }
        ];
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }
    toggleDrawer(): void {
        // Toggle the drawer
        this.matDrawer.toggle();
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

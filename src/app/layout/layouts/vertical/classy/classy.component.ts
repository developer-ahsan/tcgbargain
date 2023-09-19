import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    user: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _authService: AuthService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.user = this._authService.parseJwt(this._authService.accessToken);
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {

                if (this.user.role == 'admin') {
                    navigation.default.push(
                        {
                            id: 'users',
                            title: 'User Management',
                            type: 'basic',
                            icon: 'heroicons_outline:users',
                            link: '/apps/users'
                        },
                    )
                }
                if (this.user.role == 'vendor') {
                    navigation.default.push(
                        {
                            id: 'users',
                            title: 'Customer Management',
                            type: 'basic',
                            icon: 'heroicons_outline:users',
                            link: '/apps/users'
                        },
                    )
                }
                navigation.default.push(
                    {
                        id: 'products',
                        title: 'Products Management',
                        type: 'basic',
                        icon: 'heroicons_outline:archive',
                        link: '/apps/products'
                    },
                    {
                        id: 'stores',
                        title: 'Stores Management',
                        type: 'basic',
                        icon: 'mat_outline:storefront',
                        link: '/apps/stores'
                    },
                    {
                        id: 'shopify',
                        title: 'Shopify Management',
                        type: 'basic',
                        icon: 'heroicons_outline:briefcase',
                        link: '/apps/shopify'
                    },
                    {
                        id: 'categories',
                        title: 'Categories Management',
                        type: 'basic',
                        icon: 'heroicons_outline:briefcase',
                        link: '/apps/categories'
                    },
                );
                this.navigation = navigation;

            });

        // Subscribe to the user service

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
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

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}

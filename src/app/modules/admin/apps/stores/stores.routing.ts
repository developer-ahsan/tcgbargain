import { Route } from '@angular/router';
import { StoresListComponent } from './list/stores-list.component';
import { StoresDetailsComponents } from './details/details.component';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { StoresComponent } from './stores.component';
import { StoreInfoListComponent } from './pages/information/information.component';
import { StoreDetailsResolvers } from './stores.resolvers';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: StoresComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                component: StoresListComponent
            },
            {
                path: ':id',
                component: StoresDetailsComponents,
                resolve: {
                    user: StoreDetailsResolvers
                },
                children: [
                    {
                        path: '',
                        redirectTo: 'information',
                        pathMatch: 'full'
                    },
                    {
                        path: 'information',
                        component: StoreInfoListComponent,
                        data: {
                            title: 'Store Information',
                            url: 'information'
                        }
                    },
                    {
                        path: 'stores',
                        component: UsersStoresListComponent,
                        data: {
                            title: 'User Stores',
                            url: 'stores'
                        }
                    },
                ]
            }
        ]
    }
];

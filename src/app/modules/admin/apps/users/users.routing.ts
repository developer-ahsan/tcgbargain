import { Route } from '@angular/router';
import { UsersComponent } from './users.component';
import { UsersListComponent } from './list/users-list.component';
import { UserDetailsComponents } from './details/details.component';
import { UsersAddressesListComponent } from './pages/addresses/addresses.component';
import { UserDetailsResolvers } from './users.resolvers';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { UserInfoListComponent } from './pages/information/information.component';
import { OrdersListComponent } from './pages/orders/orders.component';

export const userRoutes: Route[] = [
    {
        path: '',
        component: UsersComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                component: UsersListComponent
            },
            {
                path: ':id',
                component: UserDetailsComponents,
                resolve: {
                    user: UserDetailsResolvers
                },
                children: [
                    {
                        path: '',
                        redirectTo: 'information',
                        pathMatch: 'full'
                    },
                    {
                        path: 'information',
                        component: UserInfoListComponent,
                        data: {
                            title: 'User Information',
                            url: 'information'
                        }
                    },
                    {
                        path: 'addresses',
                        component: UsersAddressesListComponent,
                        data: {
                            title: 'User Addresses',
                            url: 'addresses'
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
                    {
                        path: 'orders',
                        component: OrdersListComponent,
                        data: {
                            title: 'User Orders',
                            url: 'orders'
                        }
                    },
                ]
            }
        ]
    }
];

import { Route } from '@angular/router';
import { ProductsListComponent } from './list/products-list.component';
import { ProductsDetailsComponents } from './details/details.component';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { ProductsComponent } from './products.component';
import { ProductInfoListComponent } from './pages/information/information.component';
import { ProductDetailsResolvers } from './products.resolvers';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: ProductsComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                component: ProductsListComponent
            },
            {
                path: ':id',
                component: ProductsDetailsComponents,
                resolve: {
                    user: ProductDetailsResolvers
                },
                children: [
                    {
                        path: '',
                        redirectTo: 'information',
                        pathMatch: 'full'
                    },
                    {
                        path: 'information',
                        component: ProductInfoListComponent,
                        data: {
                            title: 'Product Information',
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

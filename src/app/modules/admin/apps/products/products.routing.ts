import { Route } from '@angular/router';
import { ProductsListComponent } from './list/products-list.component';
import { ProductsDetailsComponents } from './details/details.component';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { ProductsComponent } from './products.component';
import { ProductInfoListComponent } from './pages/information/information.component';
import { AllVendorsResolvers, ProductDetailsResolvers } from './products.resolvers';
import { ProductVariantsComponent } from './pages/product-variants/product-variants.component';
import { ProductPackagesComponent } from './pages/product-packages/product-packages.component';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: ProductsComponent,
        resolve: {
            vendors: AllVendorsResolvers
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
                        path: 'stores-products',
                        component: UsersStoresListComponent,
                        data: {
                            title: 'Store Products',
                            url: 'stores-products'
                        }
                    },
                    {
                        path: 'product-variants',
                        component: ProductVariantsComponent,
                        data: {
                            title: 'Product Variants',
                            url: 'product-variants'
                        }
                    },
                    {
                        path: 'product-packages',
                        component: ProductPackagesComponent,
                        data: {
                            title: 'Product Packages',
                            url: 'product-packages'
                        }
                    },
                ]

            }
        ]
    }
];

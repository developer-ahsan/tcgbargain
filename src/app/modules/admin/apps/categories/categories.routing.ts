import { Route } from '@angular/router';
import { CategoriesListComponent } from './list/categories-list.component';
import { CategoryDetailsComponents } from './details/details.component';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { CategoriesComponent } from './categories.component';
import { CategoryInfoListComponent } from './pages/information/information.component';
import { ProductDetailsResolvers } from './categories.resolvers';
import { SubCategoryComponent } from './pages/sub-cats/sub-cats.component';
import { CategoriesProductsListComponent } from './pages/categories-products/categories-products.component';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: CategoriesComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                component: CategoriesListComponent
            },
            {
                path: ':id',
                component: CategoryDetailsComponents,
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
                        component: CategoryInfoListComponent,
                        data: {
                            title: 'Category Information',
                            url: 'information'
                        }
                    },
                    {
                        path: 'sub-cats',
                        component: SubCategoryComponent,
                        data: {
                            title: 'Sub Categories',
                            url: 'sub-cats'
                        }
                    },
                    {
                        path: 'cat-products',
                        component: CategoriesProductsListComponent,
                        data: {
                            title: 'Categories Products',
                            url: 'cat-products'
                        }
                    },
                ]
            }
        ]
    }
];

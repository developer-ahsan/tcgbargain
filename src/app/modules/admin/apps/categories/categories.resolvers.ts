import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductsService } from './categories.service';

@Injectable({
    providedIn: 'root'
})
export class ProductDetailsResolvers implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _productService: ProductsService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._productService.getCategoryById(route.params.id);
    }
}
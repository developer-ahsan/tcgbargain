import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductsService } from './user-addresses.service';

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
        return this._productService.getProductById(route.params.id);
    }
}

@Injectable({
    providedIn: 'root'
})
export class AllVendorsResolvers implements Resolve<any>
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
        return this._productService.getAllVendors();
    }
}
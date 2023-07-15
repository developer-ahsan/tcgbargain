import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { VendorsService } from './vendors.service';

@Injectable({
    providedIn: 'root'
})
export class VendorDetailsResolvers implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _vendorService: VendorsService) {
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
        return this._vendorService.getVendoreById(route.params.id);
    }
}
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { StoresService } from './stores.service';

@Injectable({
    providedIn: 'root'
})
export class StoreDetailsResolvers implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _storeService: StoresService) {
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
        return this._storeService.getStoreById(route.params.id);
    }
}
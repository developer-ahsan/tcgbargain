import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, retry, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class VendorsService {
    // Private
    /**
     * Constructor
     */
    private _single_vendor: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

    constructor(private _httpClient: HttpClient,
        private _authService: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get Vendor$(): Observable<any[]> {
        return this._single_vendor.asObservable();
    };
    // =
    getVendoreById(id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendorUrl, {
            params: {
                id: id,
                list: true
            }
        }).pipe(
            tap((response: any) => {
                this._single_vendor.next(response);
            })
        );
    };
    getCalls(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendorUrl, {
            params: params
        }).pipe(retry(3));
    };
    postCalls(payload) {
        return this._httpClient.post(
            environment.vendorUrl, payload);
    };
    putCalls(payload) {
        return this._httpClient.put(
            environment.vendorUrl, payload);
    };
    deleteCalls(payload) {
        return this._httpClient.delete(
            environment.vendorUrl, { body: payload });
    };
}

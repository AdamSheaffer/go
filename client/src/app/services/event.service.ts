import { Injectable } from '@angular/core';
import { Http, RequestOptionsArgs } from '@angular/http';
import { Location } from '../shared/location.model';
import { pickBy, get } from 'lodash';
import { TicketQuery } from '../shared/ticket-query.model';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class EventService {
  domain = "http://localhost:8080";

  constructor(private http: Http) { }

  getEventsInRadius(query: TicketQuery) {
    const lat = get(query, 'coords.lat');
    const lon = get(query, 'coords.lon');
    const { range, beginDate, endDate, minPrice, maxPrice, sortBy, page } = query;
    const params = pickBy({ lat, lon, range, beginDate, endDate, minPrice, maxPrice, sortBy, page }, x => !!x);
    const args: RequestOptionsArgs = { params };
    return this.http.get(`${this.domain}/api/range`, args).toPromise().then(res => res.json());
  }

}
import { Component, OnInit, Input } from '@angular/core';
import { Trip } from '../shared/trip.model';
import { Park } from '../shared/park.model';
import { partition, uniq } from 'lodash';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  private _trips: Trip[];

  @Input() parks: Park[];

  @Input()
  set trips(trips: Trip[]) {
    this._trips = trips;
    this.calculateProgress();
  }

  get trips() { return this._trips }

  totalPercentage: number = 0;
  nlPercentage: number = 0;
  alPercentage: number = 0;

  constructor() { }

  ngOnInit() {
  }

  calculateProgress() {
    if (!this.trips || !this.trips.length) return;
    const [alParks, nlParks] = partition(this.parks, p => p.division.includes('American'));
    const visitedParks = uniq(this.trips.map(t => t.park.name));
    const visitedALParks = alParks.filter(p => visitedParks.includes(p.name))
    const visitedNLParks = nlParks.filter(p => visitedParks.includes(p.name));
    const totalParkCount = alParks.length + nlParks.length;
    this.totalPercentage = (visitedParks.length / totalParkCount) * 100;
    this.alPercentage = (visitedALParks.length / alParks.length) * 100;
    this.nlPercentage = (visitedNLParks.length / nlParks.length) * 100;
  }

}
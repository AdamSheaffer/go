import { Component, OnInit, Input } from '@angular/core';
import { Trip } from '../../shared/trip.model';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  @Input() trips: Trip[];

  photoDir = '/assets/uploads/';
  showPhotoModal = false;
  selectedPhoto: string;

  constructor() { }

  ngOnInit() {
  }

  selectPhoto(photo: string) {
    this.selectedPhoto = this.photoDir + photo;
    this.showPhotoModal = true;
  }

}
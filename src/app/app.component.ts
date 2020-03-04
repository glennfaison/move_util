import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'move-util';
  substring = '';
  sourceFolder = '';
  destinationFolder = '';

  clearForm() {
    this.substring = '';
    this.sourceFolder = '';
    this.destinationFolder = '';
  }
}

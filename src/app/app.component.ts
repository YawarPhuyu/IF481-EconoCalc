import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'econo-calc';

  constructor(
    public translate: TranslateService,
  ){

  }

  setLanguage(lang: string) {
    this.translate.use(lang);
  }
}

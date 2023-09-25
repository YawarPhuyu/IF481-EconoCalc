import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpleInterestMainComponent } from './pages/simple-interest/simple-interest-main.component';
import { TranslateService } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: SimpleInterestMainComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(
    private translate: TranslateService,
  ) {
    translate.setDefaultLang('es');
    translate.use('es');
  }
}

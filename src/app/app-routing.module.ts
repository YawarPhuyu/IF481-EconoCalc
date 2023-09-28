import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpleInterestMainComponent } from './pages/simple-interest/simple-interest-main.component';
import { TranslateService } from '@ngx-translate/core';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { CompoundInterestComponent } from './components/compound-interest/compound-interest.component';

const routes: Routes = [
  {
    path: '',
    component: WelcomePageComponent,
  },
  {
    path: 'simple-interest',
    component: SimpleInterestMainComponent,
  },
  {
    path: 'compound-interest',
    component: CompoundInterestComponent,
  },
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

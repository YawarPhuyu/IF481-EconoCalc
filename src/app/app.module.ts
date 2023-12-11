import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {PlatformLocation} from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleInterestMainComponent } from './pages/simple-interest/simple-interest-main.component';
import { InputFieldComponent } from './components/input-field/input-field.component';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { CompoundInterestComponent } from './components/compound-interest/compound-interest.component';

@NgModule({
  declarations: [
    AppComponent,
    SimpleInterestMainComponent,
    InputFieldComponent,
    NavigationBarComponent,
    WelcomePageComponent,
    CompoundInterestComponent,
  ],
  imports: [
    // Material modules
    MatToolbarModule,
    MatSidenavModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatMenuModule,
    MatDatepickerModule,

    // ngx-translate and the loader module
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient, PlatformLocation]
        }
    }),

    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient, pl: PlatformLocation): TranslateHttpLoader {
  const base_href = pl.getBaseHrefFromDOM();

  console.log("base_href");
  console.log(base_href);

  const prefix = base_href?? "/";
  
  return new TranslateHttpLoader(http, `${prefix}assets/i18n/`, ".json");
}
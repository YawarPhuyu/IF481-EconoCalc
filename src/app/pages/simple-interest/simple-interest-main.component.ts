import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { ChartComponent, ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexTitleSubtitle, ApexStroke, ApexGrid } from "ng-apexcharts";

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

export type PieChartOptions = {
  title: ApexTitleSubtitle;
  chart: ApexChart;
  series: ApexNonAxisChartSeries;
  labels: string[];
}

export interface TableRow {
  period: number;
  interest: number;
  future_value: number;
}

export const time_conversions: { [key: string]: number } = {
  year_year: 1,
  year_month: 12,
  year_week: 52.1429,
  year_day: 365,
  month_year: 0.0833334,
  month_month: 1,
  month_week: 4.34524,
  month_day: 30.4167,
  week_year: 0.0191781,
  week_month: 0.230137,
  week_week: 1,
  week_day: 7,
}

@Component({
  selector: 'app-simple-interest-main',
  templateUrl: './simple-interest-main.component.html',
  styleUrls: ['./simple-interest-main.component.scss']
})
export class SimpleInterestMainComponent implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild('paginator') paginator?: MatPaginator;

  lineChartOptions?: LineChartOptions;
  pieChartOptions?: PieChartOptions;
  labels?: { [key: string]: string } = {};

  destroy$: Subject<void> = new Subject<void>();

  form_group: FormGroup;
  table_data: MatTableDataSource<TableRow>;

  columns_to_show: string[] = ["period", "interest", "future_value"];
  frequencies: string[] = [];


  constructor(
    public translate: TranslateService,
    private fb: FormBuilder,
  ){
    this.form_group = fb.group({
      capital: [''],
      interest_rate: [''],
      interest_period: [''],
      periods: [''],
      frequency: [''],
    });

    this.table_data = new MatTableDataSource<TableRow>();
    
    this.frequencies = this.getFrecuencies();
    this.labels = translate.instant('LABELS');

    translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((lang_change) => {
      this.frequencies = this.getFrecuencies();
      this.labels = translate.instant('LABELS');
      this.setDefaultFormValues();
      this.updateCharts();
      for(let c in this.form_group.controls) {
        this.form_group.controls[c].updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.setDefaultFormValues();
  }

  ngAfterViewInit(): void {
    this.table_data.paginator = this.paginator || null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateTable = () => {
    if(this.form_group.invalid){
      return;
    }

    let data: TableRow[] = [];
    let capital: number = this.form_group.get('capital')?.value;
    let interest_rate: number = this.form_group.get('interest_rate')?.value / 100;
    let interest_period: string = this.form_group.get('interest_period')?.value;
    let periods: number = this.form_group.get('periods')?.value;
    let frequency: string = this.form_group.get('frecuency')?.value;

    for (let i = 0; i <= periods; i++){
      let row: TableRow = {
        period: i,
        interest: i * interest_rate * capital,
        future_value: (1 + (i * interest_rate)) * capital, 
      }
      data.push(row);
    }

    this.updateTable(data);
    this.updateCharts();
  }

  getFrecuencies = (): string[] => {
    let raw = this.translate.instant('FREQUENCIES');
    let frequencies: string[] = [];
    
    for(let f in raw){
      frequencies.push(raw[f]);
    }

    return frequencies;
  }
  
  setDefaultFormValues = () => {
    this.translate.get(['FREQUENCIES.ANNUALLY', 'FREQUENCIES.MONTHLY']).subscribe((data) => {
      data = Object.values(data) as Array<string>;
      this.form_group.get('interest_period')?.setValue(data[0]);
      this.form_group.get('frequency')?.setValue(data[1]);
    });
  }

  updateTable = (data: TableRow[]) => {
    this.table_data.data = data;
  }

  updateCharts = () => {
    if(this.table_data.data.length === 0) {
      this.lineChartOptions = undefined;
      this.pieChartOptions = undefined;
      return;
    }

    this.lineChartOptions = {
      series: [
        {
          name: this.labels?.['FUTURE_VALUE'],
          data: this.table_data.data.map(d => d.future_value),
        },
        {
          name: this.labels?.['INTEREST'],
          data: this.table_data.data.map(d => d.interest),
        }
      ],
      chart: {
        // height: '500px',
        type: "line",
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: this.labels?.['VALUE_OVER_TIME'],
        align: "left"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      xaxis: {
        categories: this.table_data.data.map(d => d.period),
      },
      yaxis: {
        decimalsInFloat: 2,
      }
    };

    let last_index = this.table_data.data.length - 1;

    this.pieChartOptions = {
      title: {
        text: this.labels?.['CAPITAL_VS_INTEREST'],
        align: 'left',
      },
      chart: {
        type: 'pie',
        // height: '500px',
        zoom: {
          enabled: false,
        },
      },
      series: [
        this.table_data.data[0].future_value,
        this.table_data.data[last_index].interest
      ],
      labels: [this.labels?.['CAPITAL'] || '', this.labels?.['INTEREST'] || ''],
    }
  }
}
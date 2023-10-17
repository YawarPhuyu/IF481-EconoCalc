import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { ChartComponent, ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexTitleSubtitle, ApexStroke, ApexGrid } from "ng-apexcharts";
import { ActivatedRoute, RouterLink } from '@angular/router';

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

export const time_in_days: { [key: string]: number } = {
  year: 365,
  month: 30,
  week: 7,
  day: 1,
}

@Component({
  selector: 'app-simple-interest-main',
  templateUrl: './simple-interest-main.component.html',
  styleUrls: ['./simple-interest-main.component.scss']
})
export class SimpleInterestMainComponent implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild('paginator') paginator?: MatPaginator;

  MQ = null;

  lineChartOptions?: LineChartOptions;
  pieChartOptions?: PieChartOptions;
  labels?: { [key: string]: string } = {};

  destroy$: Subject<void> = new Subject<void>();

  form_group: FormGroup;
  table_data: MatTableDataSource<TableRow>;

  columns_to_show: string[] = ["period", "interest", "future_value"];
  frequencies: string[] = [];

  fill_function?: (capital: number, periods: number, fixed_interest: number) => TableRow[];

  constructor(
    public translate: TranslateService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ){
    route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.fill_function = data['fill_function'];
    });

    this.form_group = fb.group({
      capital: [''],
      interest_rate: [''],
      interest_period: [''],
      periods: [''],
      frequency: [''],
      fixed_interest: [{ value: '', disabled: true }]
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

    let capital: number = this.form_group.get('capital')?.value;
    let interest_rate: number = this.form_group.get('interest_rate')?.value;
    let interest_period: string = this.form_group.get('interest_period')?.value;
    let periods: number = this.form_group.get('periods')?.value;
    let frequency: string = this.form_group.get('frequency')?.value;

    let interest_period_in_days = time_in_days[interest_period];
    let frequency_in_days = time_in_days[frequency];
    
    let time_conversion: number;
    let fixed_interest: number;

    if(interest_period_in_days > frequency_in_days) { 
      time_conversion = Math.floor(interest_period_in_days / frequency_in_days);
      fixed_interest = interest_rate / time_conversion;
    }
    else {
      time_conversion = Math.floor(frequency_in_days / interest_period_in_days);
      fixed_interest = interest_rate * time_conversion;
    }

    this.form_group.get('fixed_interest')?.setValue(fixed_interest);
    fixed_interest /= 100;

    // console.log({
    //   interest_period_days: time_in_days[interest_period],
    //   frequency_days: time_in_days[frequency],
    //   conversion_rate: time_conversion
    // });

    let data: TableRow[] = [];

    if(this.fill_function)
      data = this.fill_function(capital, periods, fixed_interest);

    // for (let i = 0; i <= periods; i++){
    //   let row: TableRow = {
    //     period: i,
    //     interest: (i * fixed_interest * capital),
    //     future_value: ((1 + (i * fixed_interest)) * capital), 
    //   }
    //   data.push(row);
    // }

    this.updateTable(data);
    this.updateCharts();
  }

  randomFill = (): void => {
    let time_units = Object.keys(time_in_days);
    this.form_group.get('capital')?.setValue(8000 + (Math.random() * 10000));
    this.form_group.get('interest_rate')?.setValue(5 + (Math.random() * 15));
    this.form_group.get('interest_period')?.setValue(time_units[Math.floor(Math.random() * time_units.length)]);
    this.form_group.get('periods')?.setValue(1 + Math.floor(Math.random() * 40));
    this.form_group.get('frequency')?.setValue(time_units[Math.floor(Math.random() * time_units.length)]);
  }

  getFrecuencies = (): any[] => {
    let raw = this.translate.instant('FREQUENCIES');
    let frequencies: { [key: string]: string }[] = [];
    
    for(let f in raw){
      frequencies.push({
        label: raw[f],
        translate_key: `FREQUENCIES.${f}`,
        value: f
      });
    }

    return frequencies;
  }
  
  setDefaultFormValues = () => {
    // this.translate.get(['FREQUENCIES.ANNUALLY', 'FREQUENCIES.MONTHLY']).subscribe((data) => {
    //   data = Object.values(data) as Array<string>;
    //   this.form_group.get('interest_period')?.setValue(data[0]);
    //   this.form_group.get('frequency')?.setValue(data[1]);
    // });
    this.form_group.get('interest_period')?.setValue('year');
    this.form_group.get('frequency')?.setValue('month');
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

  static simple_interest_latex = "C_{f} = C_{i}\left(1 + \frac{i}{100}\right)t";
  
  static simple_interest_fill = (capital: number, periods: number, fixed_interest: number): TableRow[] => {
    let data:TableRow[] = [];
    for (let i = 0; i <= periods; i++){
      let row: TableRow = {
        period: i,
        interest: capital * (i * fixed_interest),
        future_value: capital * (1 + (i * fixed_interest)), 
      }
      data.push(row);
    }
    return data;
  };

  static compound_interest_latex = "C_{f} = C_{i} (1 + i)^{t}";

  static compound_interest_fill = (capital: number, periods: number, fixed_interest: number): TableRow[] => {
    let data:TableRow[] = [];
    for (let i = 0; i <= periods; i++){
      let row: TableRow = {
        period: i,
        interest: (capital * Math.pow(1 + fixed_interest, i)) - capital,
        future_value: capital * Math.pow(1 + fixed_interest, i), 
      }
      data.push(row);
    }
    return data;
  };
}
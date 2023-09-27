import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

export interface TableRow {
  period: number;
  interest: number;
  future_value: number;
}

@Component({
  selector: 'app-simple-interest-main',
  templateUrl: './simple-interest-main.component.html',
  styleUrls: ['./simple-interest-main.component.scss']
})
export class SimpleInterestMainComponent implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild('paginator') paginator?: MatPaginator;

  chartOptions?: ChartOptions;
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
      capital: ['', [Validators.required]],
      interest_rate: ['', [Validators.required]],
      periods: ['', [Validators.required]],
      frequency: ['', [Validators.required]],
    });

    this.table_data = new MatTableDataSource<TableRow>();
    
    translate.get('FREQUENCIES').subscribe((data) => {
      if(!data)
        return;

      for(let lap in data){
        this.frequencies.push(data[lap]);
      }
    });

    translate.get('LABELS').subscribe(tr => this.labels = tr);
  }

  ngOnInit(): void {
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
      console.log(this.form_group.valid);
      return;
    }

    let data: TableRow[] = [];
    let capital: number = this.form_group.get('capital')?.value;
    let interest_rate: number = this.form_group.get('interest_rate')?.value / 100;
    let periods: number = this.form_group.get('periods')?.value;

    for (let i = 0; i <= periods; i++){
      let row: TableRow = {
        period: i,
        interest: i * interest_rate * capital,
        future_value: (1 + (i * interest_rate)) * capital, 
      }
      data.push(row);
    }

    this.updateTable(data);
    this.updateChart();
  }

  updateTable = (data: TableRow[]) => {
    this.table_data.data = data;
  }

  updateChart = () => {
    this.chartOptions = {
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
        height: 350,
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
        text: "Money growth",
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
  }
}
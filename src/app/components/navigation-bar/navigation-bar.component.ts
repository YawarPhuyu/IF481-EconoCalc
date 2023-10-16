import { Component } from '@angular/core';

export type Option = {
  title: string,
  icon: string,
  router_link: string,
}

@Component({
  selector: 'navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {

  options: Option[] = [
    {
      title: 'LABELS.SIMPLE_INTEREST',
      icon: 'show_chart',
      router_link: '/simple-interest'
    },
    {
      title: 'LABELS.COMPOUND_INTEREST',
      icon: 'stacked_line_chart',
      router_link: '/compound-interest'
    }
  ];

  selected_option?: Option;

  constructor(){}
}

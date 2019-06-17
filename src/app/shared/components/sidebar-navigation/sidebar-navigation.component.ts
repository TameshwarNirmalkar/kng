import { Component, OnInit } from '@angular/core';

import { SideBarNavigationModel, LinkModel } from './sidebar-navigation-model';

@Component({
  selector: 'app-sidebar-navigation',
  templateUrl: './sidebar-navigation.component.html',
  styleUrls: ['./sidebar-navigation.component.scss']
})
export class SidebarNavigationComponent implements OnInit {

  public navigationList: LinkModel[] = new SideBarNavigationModel().getSideBarNavigation();

  public sidebarToggle: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  toggleSlider() {
    this.sidebarToggle = !this.sidebarToggle;
  }

}


export class LinkModel {
  label?: string;
  icon?: string;
  routerLink?: Array<string>;
  queryParams?: string;
}

export class SideBarNavigationModel {

  private generateLink: LinkModel[] = [
    {
      label: 'Dashboard',
      icon: 'fas fa-laptop',
      routerLink: ['/web/dashboard']
    },
    {
      label: 'Permission',
      icon: 'fas fa-user-shield',
      routerLink: ['/web/permission']
    },
    {
      label: 'Party Details',
      icon: 'fas fa-user-cog',
      routerLink: ['/web/party']
    },
    {
      label: 'Login As',
      icon: 'fas fa-user-lock',
      routerLink: ['/web/role']
    },
    {
      label: 'RFID',
      icon: 'fas fa-users',
      routerLink: ['/web/rfid']
    },
    {
      label: 'Resource',
      icon: 'fas fa-poll-h',
      routerLink: ['/web/resource']
    }
  ];

  getSideBarNavigation() {
    return this.generateLink;
  }

  addNewLink(data: LinkModel) {
    this.generateLink.push(data);
  }
}

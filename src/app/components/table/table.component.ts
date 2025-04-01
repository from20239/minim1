import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserComponent } from '../create-user/create-user.component';
import { TableFilterPipe } from '../../pipes/table-filter.pipe';
import { FormsModule } from '@angular/forms';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatDialogComponent],

  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

  searchText: string = ''; // Texto de búsqueda

    showChatDialog = false;
    selectedUserId: string = ''; 

  openCreateUserModal() {
    this.dialog.open(CreateUserComponent, {
      width: '600px', // Ajusta el ancho del modal
      height: 'auto', // Ajusta la altura del modal automáticamente
      panelClass: 'custom-dialog-container' // Clase CSS personalizada para el modal
    });
  }

  @Input() set data(value: any[]) {
    this._data = value.map((item, index) => ({ ...item, num: index + 1, flag: item.flag ?? false }));
    this.totalPages = Math.ceil(this._data.length / this.rowsPerPage);
  }
  get data() {
    return this._data;
  }
  private _data: any[] = [];

  @Input() columns: { key: string, label: string }[] = []; 
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  constructor(private apiService: ApiService, private router: Router, private dialog: MatDialog) {}

  currentPage: number = 1;
  rowsPerPage: number = 5;
  rowsPerPageOptions: number[] = [5, 10, 15, 20];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  totalPages: number = 0;


    // 新增聊天方法
    openChat(userId: string) {
      this.dialog.open(ChatDialogComponent, {
        width: '500px',
        data: { targetUserId: userId }
      });
    }

    closeChat() {
      this.showChatDialog = false;
    }
  
  get sortedData() {
  if (!this.sortColumn || this.sortColumn === 'num') {
    return this.data;
  }
  return [...this.data].sort((a, b) => {
    let valueA = a[this.sortColumn] ?? ''; 
    let valueB = b[this.sortColumn] ?? ''; 

    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();

    if (valueA < valueB) {
      return this.sortDirection === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return this.sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });




}

getUsers(page: number, limit: number) {
  this.apiService.getAllUsers(page, limit).subscribe({
    next: (data) => {
      console.log('Usuarios cargados:', data);
      const newUsers = data.map((user: any) => ({
        ...user,
        flag: user.flag ?? false
      }));
      const uniqueUsers = newUsers.filter((newUser: any) => !this._data.some(existingUser => existingUser._id === newUser._id));
      this._data = [...this._data, ...uniqueUsers];
      this._data = this._data.map((item, index) => ({ ...item, num: index + 1 })); // Recalculate numbering
      this.totalPages = Math.ceil(this._data.length / this.rowsPerPage);
    },
    error: (err) => {
      console.error('Error obteniendo los datos de los usuarios', err);
    }
  });
}
onSearchChange() {
  this.currentPage = 1; // Reinicia a la primera página al cambiar el texto de búsqueda
}

      get paginatedData() {
      // Filtrar los datos primero
      const filteredData = new TableFilterPipe().transform(this.sortedData, this.searchText, ['name']);
    
      // Recalcular el número total de páginas basado en los datos filtrados
      this.totalPages = Math.ceil(filteredData.length / this.rowsPerPage);
    
      // Ajustar la página actual si excede el número total de páginas
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages || 1; // Si no hay resultados, vuelve a la página 1
      }
    
      // Calcular el índice inicial y final para la paginación
      const startIndex = (this.currentPage - 1) * this.rowsPerPage;
      return filteredData.slice(startIndex, startIndex + this.rowsPerPage);
    }
  // get paginatedDataWithIndex() {
  //   const startIndex = (this.currentPage - 1) * this.rowsPerPage;
  //   return this.paginatedData.map((item, index) => ({
  //     ...item,
  //     num: startIndex + index + 1
  //   }));
  // }
  
  

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

  changePage(increment: number) {
    if(increment === 1 && this.currentPage === this.totalPages)
    {
      this.getUsers(this.currentPage + 1, this.rowsPerPage);
      
    }
    this.currentPage += increment;
  }

  changeRowsPerPage(event: any) {

    if(this.currentPage === this.totalPages)
    {
      this.getUsers(this.currentPage , parseInt(event.target.value, 10));
    }
    this.rowsPerPage = parseInt(event.target.value, 10);

    this.currentPage = 1; // Reset to first page
  }

  changePageToFirst() {
    this.currentPage = 1;
  }

  changePageToLast() {
    this.currentPage = Math.ceil(this.data.length / this.rowsPerPage);
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1; // Reset to first page
  }

  inactivateUser(item: any) {
    this.apiService.inactivateUser(item._id).subscribe({
      next: (data) => {
        console.log('Usuario inactivado:', data);
        item.Flag = false;
      },
      error: (err) => {
        console.error('Error inactivando el usuario', err);
      }
  });
}
  activateUser(item: any) {
    this.apiService.activateUser(item._id).subscribe({
      next: (data) => {
        console.log('Usuario activado:', data);
        item.Flag = true;
      },
      error: (err) => {
        console.error('Error activando el usuario', err);
      }
  });

}

editUser(item: any) {
  this.router.navigate(['/edit', item._id]);
}

ViewProfile(item: any) {
  this.router.navigate(['/profile', item._id]);
}


}

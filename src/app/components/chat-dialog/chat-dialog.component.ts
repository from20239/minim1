import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service'; // 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css']
})
export class ChatDialogComponent {
  @Input() targetUserId: string = '';
  messages: Message[] = [];
  newMessage: string = '';
  get currentUserId(): string {
    return this.authService.getCurrentUserId();
  }

  constructor(
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { targetUserId: string },
    private apiService: ApiService, // 改为注入ApiService
    private authService: AuthService
  ) {
    this.loadMessages();
  }

  loadMessages() {
    this.apiService.getConversation(this.currentUserId, this.data.targetUserId)
      .subscribe({
        next: (messages: Message[]) => this.messages = messages, // 明确类型
        error: (err: any) => console.error('fail to get msg', err) // 明确类型
      });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.apiService.sendMessage({
        sender: this.currentUserId,
        receiver: this.data.targetUserId,
        content: this.newMessage
      }).subscribe({
        next: () => {
          this.newMessage = '';
          this.loadMessages();
        },
        error: (err: any) => console.error('fail to send', err) // 明确类型
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = '/api/messages'; // 与你的后端API端点一致

  constructor(private http: HttpClient) {}

  /**
   * 发送消息
   * @param message 消息内容 {sender, receiver, content}
   */
  sendMessage(message: {
    sender: string;
    receiver: string;
    content: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, message);
  }

  /**
   * 获取两个用户之间的对话
   * @param user1 用户1 ID
   * @param user2 用户2 ID
   */
  getConversation(user1: string, user2: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${user1}/${user2}`);
  }

  /**
   * 获取用户的所有对话列表（可选实现）
   * @param userId 当前用户ID
   */
  getUserConversations(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${userId}`);
  }
}
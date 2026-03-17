import { Component, input } from '@angular/core';

export interface User {
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  template: `
    <div class="user-avatar">
      <span class="user-avatar__initials">{{ initials() }}</span>
      <div class="user-avatar__info">
        <strong>{{ user()?.name }}</strong>
        <span>{{ user()?.email }}</span>
      </div>
    </div>
  `,
  styles: `
    .user-avatar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .user-avatar__initials {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #007bff;
      color: white;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .user-avatar__info {
      display: flex;
      flex-direction: column;
      font-size: 0.875rem;
    }

    .user-avatar__info span {
      color: #666;
      font-size: 0.75rem;
    }
  `,
})
export class UserAvatarComponent {
  readonly user = input<User>();

  initials = () => {
    const name = this.user()?.name ?? '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
}

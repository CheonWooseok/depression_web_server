import { Injectable } from '@nestjs/common';
import { scanTable } from 'src/db/dynamodb';

export interface User {
  user_id: string;
  allow: string;
  default: string;
  group: string;
}

@Injectable()
export class UserService {
  async getUsers(): Promise<any> {
    const users = await scanTable('DepressionApp_Eval');

    return users;
  }
}

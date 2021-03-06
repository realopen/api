import { FindConditions, Repository, UpdateResult } from 'typeorm';
import dfAddMonths from 'date-fns/addMonths';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Bill, User } from '@app/entities';
import { format, newDate } from '@app/utils/date';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findOne({ username = '' }): Promise<User> {
    const where: FindConditions<User> = {};

    if (username) {
      where.username = username;
    }

    return this.userRepository.findOne({
      where,
    });
  }

  async updateEmbago(
    username: string,
    {
      embagoMonth,
    }: {
      embagoMonth: number;
    },
  ): Promise<UpdateResult> {
    const bills = await this.billRepository.find({
      where: {
        user_id: username,
      },
    });

    for (let i = 0; i < bills.length; i++) {
      const publicDate = format(
        dfAddMonths(newDate(bills[i].request_date), embagoMonth),
        'YYYY-MM-DD',
      );

      await this.billRepository.update(
        {
          id: bills[i].id,
        },
        {
          public_date: publicDate,
        },
      );
    }

    return this.userRepository.update(
      {
        username,
      },
      {
        embago_month: embagoMonth,
      },
    );
  }
}

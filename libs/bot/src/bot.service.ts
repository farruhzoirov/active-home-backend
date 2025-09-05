import { Injectable, Logger } from '@nestjs/common';
import { Bot, Context } from 'grammy';
import { PrismaService } from '@app/database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService {
  private bot: Bot<Context>;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const telegramBotToken = this.configService.get('AUTH').TELEGRAM_BOT_TOKEN;

    if (!telegramBotToken) {
      Logger.error('TELEGRAM_BOT_TOKEN is not provided');
    }

    this.bot = new Bot(telegramBotToken);

    this.bot.on('message:contact', async (ctx) => {
      const phone = ctx.message.contact.phone_number;
      const telegramId = ctx.from.id;

      await this.prisma.user.update({
        where: { telegramId },
        data: { phone },
      });

      await ctx.reply('Rahmat! Telefon raqamingingiz qabul qilindi ✅');
    });

    this.bot.start();
    Logger.log('Bot is running ✅');
  }

  async requestPhoneNumber(telegramId: number) {
    await this.bot.api.sendMessage(
      telegramId,
      'Iltimos xavfsizlik yuzasidan telefon raqamingizni ulashing',
      {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamni yuborish', request_contact: true }],
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      },
    );
  }
}

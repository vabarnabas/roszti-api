import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { AtGuard, RtGuard } from 'src/common/guards';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
  ) {}

  @Public()
  @Post('/local/signin')
  @HttpCode(200)
  signinLocal(@Body() dto: AuthDto) {
    return this.authService.signinLocal(dto);
  }

  @UseGuards(AtGuard)
  @Post('/logout')
  @HttpCode(200)
  logout(@GetCurrentUser('id') id: string) {
    return this.authService.logout(id);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('/refresh')
  @HttpCode(200)
  refresh(
    @GetCurrentUser('id') id: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refresh(id, refreshToken);
  }

  @Get('current')
  currentUser(@GetCurrentUser('id') id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      include: { participant: true, roles: true, profile: true },
    });
  }

  @Post('permit')
  async permit(
    @GetCurrentUser('id') id: string,
    @Body() body: { permission: string },
  ) {
    const roles = await this.prismaService.role.findMany({
      where: { users: { some: { id } } },
    });

    const roleIds = roles.map((role) => {
      return role.id;
    });

    const permissions = await this.prismaService.permission.findMany({
      where: { roles: { every: { id: { in: roleIds } } } },
    });

    const permissionIds = permissions.map((permission) => {
      return permission.code;
    });

    if (
      permissionIds
        .map((permission) => {
          return permission.toLowerCase();
        })
        .includes(body.permission.toLowerCase())
    ) {
      return true;
    } else {
      throw new ForbiddenException('Access denied.');
    }
  }
}

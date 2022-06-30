import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { AtGuard, RtGuard } from 'src/common/guards';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
}

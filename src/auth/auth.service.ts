import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getToken(id: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
          email,
        },
        { secret: 'at-secret', expiresIn: 60 * 60 },
      ),
      this.jwtService.signAsync(
        {
          id,
          email,
        },
        { secret: 'rt-secret', expiresIn: 60 * 60 * 24 * 7 },
      ),
    ]);

    return {
      access_token: at,
      refesh_token: rt,
    };
  }

  async updateRefreshTokenHash(id: string, refreshToken: string) {
    const hashedToken = await hash(refreshToken, 10);

    await this.prismaService.user.update({
      where: { id },
      data: { refreshToken: hashedToken },
    });
  }

  async signinLocal(dto: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new ForbiddenException('Access denied.');

    const passwordMatches = await compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access denied.');

    const tokens = await this.getToken(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refesh_token);
    return tokens;
  }

  async logout(id: string) {
    await this.prismaService.user.updateMany({
      where: { id: id, refreshToken: { not: null } },
      data: { refreshToken: null },
    });
  }

  async refresh(id: string, refreshToken: string) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access denied.');

    const tokenMatches = await compare(refreshToken, user.refreshToken);
    if (!tokenMatches) throw new ForbiddenException('Access denied.');

    const tokens = await this.getToken(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refesh_token);
    return tokens;
  }
}

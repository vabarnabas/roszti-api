import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionType } from '../types/permission.types';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PermissionType[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    console.log(user);

    return (
      requiredRoles.some((role) => user.permissions.includes(role)) ||
      user.permissions.include(PermissionType.SuperAdmin)
    );
  }
}

import { Permission, Role, User, Event } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { hash, genSalt } from 'bcrypt';
import { Optional } from 'src/common/types/utility.types';

const prisma = new PrismaClient();

const user: Optional<User, 'id'> = {
  displayName: 'Super Admin',
  email: 'superadmin@roszti.com',
  userName: 'superadmin',
  password: 'aa',
  code: 'SUPER1',
  active: true,
  refreshToken: null,
};

const permission: Optional<Permission, 'id'> = {
  code: 'SuperAdmin',
};

const role: Optional<Role, 'id'> = {
  code: 'SuperAdmin',
};

const event: Optional<Event, 'id'> = {
  displayName: 'Test Event',
  description: 'This is a Test Event',
  startDate: new Date(Date.now()),
  endDate: null,
  slug: 'testevent',
  type: 'LOCAL',
};

const main = async () => {
  if (user.password) {
    const salt = await genSalt();
    user.password = await hash(user.password, salt);
  }

  const createdPermission = await prisma.permission.create({
    data: permission,
  });

  const createdRole = await prisma.role.create({
    data: { ...role, permissions: { connect: { id: createdPermission.id } } },
  });

  await prisma.user.create({
    data: {
      ...user,
      roles: { connect: { id: createdRole.id } },
    },
  });

  await prisma.event.create({
    data: event,
  });
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// @ts-ignore - Prisma types may not be recognized by TypeScript server
const prisma = new PrismaClient() as any;

async function main() {
  console.log('🌱 Seeding database...');

  // Clean database
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  console.log('📋 Creating permissions...');
  
  // Criar todas as permissões do sistema
  const permissions = await Promise.all([
    // Clients
    prisma.permission.create({ data: { name: 'clients.read', description: 'Visualizar clientes', module: 'clients' } }),
    prisma.permission.create({ data: { name: 'clients.create', description: 'Criar clientes', module: 'clients' } }),
    prisma.permission.create({ data: { name: 'clients.update', description: 'Editar clientes', module: 'clients' } }),
    prisma.permission.create({ data: { name: 'clients.delete', description: 'Deletar clientes', module: 'clients' } }),
    
    // Appointments
    prisma.permission.create({ data: { name: 'appointments.read', description: 'Visualizar agendamentos', module: 'appointments' } }),
    prisma.permission.create({ data: { name: 'appointments.create', description: 'Criar agendamentos', module: 'appointments' } }),
    prisma.permission.create({ data: { name: 'appointments.update', description: 'Editar agendamentos', module: 'appointments' } }),
    prisma.permission.create({ data: { name: 'appointments.delete', description: 'Deletar agendamentos', module: 'appointments' } }),
    
    // Users
    prisma.permission.create({ data: { name: 'users.list', description: 'Listar usuários', module: 'users' } }),
    prisma.permission.create({ data: { name: 'users.read', description: 'Visualizar usuários', module: 'users' } }),
    prisma.permission.create({ data: { name: 'users.create', description: 'Criar usuários', module: 'users' } }),
    prisma.permission.create({ data: { name: 'users.update', description: 'Editar usuários', module: 'users' } }),
    prisma.permission.create({ data: { name: 'users.delete', description: 'Deletar usuários', module: 'users' } }),
    
    // Staff
    prisma.permission.create({ data: { name: 'staff.read', description: 'Visualizar profissionais', module: 'staff' } }),
    prisma.permission.create({ data: { name: 'staff.create', description: 'Criar profissionais', module: 'staff' } }),
    prisma.permission.create({ data: { name: 'staff.update', description: 'Editar profissionais', module: 'staff' } }),
    prisma.permission.create({ data: { name: 'staff.delete', description: 'Deletar profissionais', module: 'staff' } }),
    
    // Services
    prisma.permission.create({ data: { name: 'services.read', description: 'Visualizar serviços', module: 'services' } }),
    prisma.permission.create({ data: { name: 'services.create', description: 'Criar serviços', module: 'services' } }),
    prisma.permission.create({ data: { name: 'services.update', description: 'Editar serviços', module: 'services' } }),
    prisma.permission.create({ data: { name: 'services.delete', description: 'Deletar serviços', module: 'services' } }),
    
    // Products
    prisma.permission.create({ data: { name: 'products.read', description: 'Visualizar produtos', module: 'products' } }),
    prisma.permission.create({ data: { name: 'products.create', description: 'Criar produtos', module: 'products' } }),
    prisma.permission.create({ data: { name: 'products.update', description: 'Editar produtos', module: 'products' } }),
    prisma.permission.create({ data: { name: 'products.delete', description: 'Deletar produtos', module: 'products' } }),
    
    // Sales
    prisma.permission.create({ data: { name: 'sales.read', description: 'Visualizar vendas', module: 'sales' } }),
    prisma.permission.create({ data: { name: 'sales.create', description: 'Criar vendas', module: 'sales' } }),
    
    // Payments
    prisma.permission.create({ data: { name: 'payments.read', description: 'Visualizar pagamentos', module: 'payments' } }),
    prisma.permission.create({ data: { name: 'payments.create', description: 'Criar pagamentos', module: 'payments' } }),
    prisma.permission.create({ data: { name: 'payments.update', description: 'Editar pagamentos', module: 'payments' } }),
    
    // Expenses
    prisma.permission.create({ data: { name: 'expenses.read', description: 'Visualizar despesas', module: 'expenses' } }),
    prisma.permission.create({ data: { name: 'expenses.create', description: 'Criar despesas', module: 'expenses' } }),
    prisma.permission.create({ data: { name: 'expenses.update', description: 'Editar despesas', module: 'expenses' } }),
    prisma.permission.create({ data: { name: 'expenses.delete', description: 'Deletar despesas', module: 'expenses' } }),
    
    // Reports
    prisma.permission.create({ data: { name: 'reports.read', description: 'Visualizar relatórios', module: 'reports' } }),
    
    // Roles
    prisma.permission.create({ data: { name: 'roles.read', description: 'Visualizar cargos', module: 'roles' } }),
    prisma.permission.create({ data: { name: 'roles.create', description: 'Criar cargos', module: 'roles' } }),
    prisma.permission.create({ data: { name: 'roles.update', description: 'Editar cargos', module: 'roles' } }),
    prisma.permission.create({ data: { name: 'roles.delete', description: 'Deletar cargos', module: 'roles' } }),
    prisma.permission.create({ data: { name: 'roles.assign', description: 'Atribuir cargos', module: 'roles' } }),
    
    // Reviews
    prisma.permission.create({ data: { name: 'reviews.read', description: 'Visualizar avaliações', module: 'reviews' } }),
    
    // Waitlist
    prisma.permission.create({ data: { name: 'waitlist.read', description: 'Visualizar lista de espera', module: 'waitlist' } }),
    prisma.permission.create({ data: { name: 'waitlist.create', description: 'Criar itens na lista de espera', module: 'waitlist' } }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  console.log('👥 Creating roles...');

  // Criar role de Admin com todas as permissões
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Administrador com acesso total ao sistema',
      isSystem: true,
    },
  });

  // Atribuir todas as permissões ao Admin
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log(`✅ Created role 'Admin' with all permissions`);

  // Criar role de Recepção com permissões específicas
  const receptionRole = await prisma.role.create({
    data: {
      name: 'Recepção',
      description: 'Recepcionista com acesso a clientes e agendamentos',
      isSystem: true,
    },
  });

  // Permissões para Recepção
  const receptionPermissions = permissions.filter((p: any) => 
    p.name.startsWith('clients.') || 
    p.name.startsWith('appointments.') ||
    p.name === 'staff.read' ||
    p.name === 'services.read' ||
    p.name === 'waitlist.read' ||
    p.name === 'waitlist.create'
  );

  for (const permission of receptionPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: receptionRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log(`✅ Created role 'Recepção' with ${receptionPermissions.length} permissions`);

  // Criar role de Staff (Profissional) com permissões básicas
  const staffRole = await prisma.role.create({
    data: {
      name: 'Profissional',
      description: 'Profissional do salão com acesso limitado',
      isSystem: true,
    },
  });

  // Permissões para Profissional
  const staffPermissions = permissions.filter((p: any) => 
    p.name === 'appointments.read' ||
    p.name === 'clients.read' ||
    p.name === 'services.read'
  );

  for (const permission of staffPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: staffRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log(`✅ Created role 'Profissional' with ${staffPermissions.length} permissions`);

  console.log('👤 Creating users...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@salao.com',
      passwordHash: adminPassword,
      name: 'Administrador',
      roleId: adminRole.id,
      phone: '11999999999',
    },
  });

  // Create reception user
  const receptionPassword = await bcrypt.hash('reception123', 12);
  const reception = await prisma.user.create({
    data: {
      email: 'recepcao@salao.com',
      passwordHash: receptionPassword,
      name: 'Recepcionista',
      roleId: receptionRole.id,
      phone: '11988888888',
    },
  });

  // Create staff users
  const staff1Password = await bcrypt.hash('staff123', 12);
  const staff1User = await prisma.user.create({
    data: {
      email: 'maria@salao.com',
      passwordHash: staff1Password,
      name: 'Maria Silva',
      roleId: staffRole.id,
      phone: '11977777777',
    },
  });

  const staff1 = await prisma.staff.create({
    data: {
      userId: staff1User.id,
      specialties: ['cabelo', 'maquiagem'],
      commissionType: 'PERCENT',
      commissionValue: 40,
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '09:00', end: '14:00' },
      },
    },
  });

  const staff2Password = await bcrypt.hash('staff123', 12);
  const staff2User = await prisma.user.create({
    data: {
      email: 'ana@salao.com',
      passwordHash: staff2Password,
      name: 'Ana Costa',
      roleId: staffRole.id,
      phone: '11966666666',
    },
  });

  const staff2 = await prisma.staff.create({
    data: {
      userId: staff2User.id,
      specialties: ['unha', 'sobrancelha'],
      commissionType: 'PERCENT',
      commissionValue: 50,
      workSchedule: {
        monday: { start: '10:00', end: '19:00' },
        tuesday: { start: '10:00', end: '19:00' },
        wednesday: { start: '10:00', end: '19:00' },
        thursday: { start: '10:00', end: '19:00' },
        friday: { start: '10:00', end: '19:00' },
      },
    },
  });

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Corte Feminino',
        description: 'Corte de cabelo feminino com lavagem e secagem',
        durationMinutes: 60,
        price: 80,
        category: 'cabelo',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Corte Masculino',
        description: 'Corte de cabelo masculino',
        durationMinutes: 30,
        price: 50,
        category: 'cabelo',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Manicure',
        description: 'Manicure completa',
        durationMinutes: 45,
        price: 40,
        category: 'unha',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Pedicure',
        description: 'Pedicure completa',
        durationMinutes: 60,
        price: 50,
        category: 'unha',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Maquiagem',
        description: 'Maquiagem profissional',
        durationMinutes: 90,
        price: 150,
        category: 'maquiagem',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Design de Sobrancelha',
        description: 'Design e modelagem de sobrancelha',
        durationMinutes: 30,
        price: 35,
        category: 'sobrancelha',
      },
    }),
  ]);

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Julia Santos',
        phone: '11955555555',
        email: 'julia@email.com',
        birthdate: new Date('1990-05-15'),
        consentLGPD: true,
        consentDate: new Date(),
      },
    }),
    prisma.client.create({
      data: {
        name: 'Carla Oliveira',
        phone: '11944444444',
        email: 'carla@email.com',
        birthdate: new Date('1985-08-22'),
        consentLGPD: true,
        consentDate: new Date(),
      },
    }),
    prisma.client.create({
      data: {
        name: 'Pedro Almeida',
        phone: '11933333333',
        email: 'pedro@email.com',
        consentLGPD: true,
        consentDate: new Date(),
      },
    }),
  ]);

  // Create sample appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const appointment = await prisma.appointment.create({
    data: {
      clientId: clients[0].id,
      staffId: staff1.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      status: 'CONFIRMED',
      services: [
        {
          id: services[0].id,
          name: services[0].name,
          price: services[0].price,
          duration: services[0].durationMinutes,
        },
      ],
      totalAmount: services[0].price,
      createdBy: admin.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Created:');
  console.log(`- ${4} users (1 admin, 1 reception, 2 staff)`);
  console.log(`- ${2} staff profiles`);
  console.log(`- ${services.length} services`);
  console.log(`- ${clients.length} clients`);
  console.log(`- ${1} appointment`);
  console.log('\n🔐 Login credentials:');
  console.log('Admin: admin@salao.com / admin123');
  console.log('Recepção: recepcao@salao.com / reception123');
  console.log('Staff 1: maria@salao.com / staff123');
  console.log('Staff 2: ana@salao.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@salao.com',
      passwordHash: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
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
      role: 'RECEPTION',
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
      role: 'STAFF',
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
      role: 'STAFF',
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

import { DataSource } from 'typeorm';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export const seedDatabase = async (dataSource: DataSource) => {
  // Create admin user
  const userRepository = dataSource.getRepository(User);

  const adminExists = await userRepository.findOne({
    where: { email: 'admin@example.com' },
  });

  if (!adminExists) {
    const adminUser = userRepository.create({
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      skills: ['Management', 'Leadership'],
      isActive: true,
    });

    await userRepository.save(adminUser);
  }

  // Create test users
  const testUsers = [
    {
      email: 'manager@example.com',
      password: await bcrypt.hash('manager123', 10),
      firstName: 'Manager',
      lastName: 'User',
      role: UserRole.MANAGER,
      skills: ['Project Management', 'Agile'],
    },
    {
      email: 'member@example.com',
      password: await bcrypt.hash('member123', 10),
      firstName: 'Team',
      lastName: 'Member',
      role: UserRole.MEMBER,
      skills: ['Development', 'Testing'],
    },
  ];

  for (const userData of testUsers) {
    const userExists = await userRepository.findOne({
      where: { email: userData.email },
    });
    if (!userExists) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
    }
  }
};

// Execute seeder
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'project_manage',
});

dataSource
  .initialize()
  .then(async () => {
    console.log('Seeding database...');
    await seedDatabase(dataSource);
    console.log('Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during database seeding:', error);
    process.exit(1);
  });

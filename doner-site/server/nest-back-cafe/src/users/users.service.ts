import { Injectable, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { RegisterDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.seedAdmin();
    }

    async seedAdmin() {
        const adminEmail = 'admin@admin.ru';
        let adminUser = await this.findByEmail(adminEmail);
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('admin1', 10);
            adminUser = this.usersRepository.create({
                email: adminEmail,
                password: hashedPassword,
                name: 'Administrator',
                role: 'admin',
            });
            await this.usersRepository.save(adminUser);
            console.log('Admin user seeded successfully with email: admin@admin.ru');
        } else if (adminUser.role !== 'admin') {
            adminUser.role = 'admin';
            await this.usersRepository.save(adminUser);
            console.log('Admin user role updated to admin');
        }
    }

    async create(registerDto: RegisterDto): Promise<User> {
        const { email, password, name, phone, address } = registerDto;

        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            name,
            phone,
            address,
        });

        return this.usersRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.usersRepository.findOne({ where: { email } });
        return user;
    }

    async findById(id: number): Promise<User | null> {
        const user = await this.usersRepository.findOne({ where: { id } });
        return user;
    }

    async update(id: number, updateData: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, updateData);
        return this.findById(id);
    }
}

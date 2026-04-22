import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(
        @InjectRepository(Settings)
        private settingsRepo: Repository<Settings>,
    ) { }

    async onModuleInit() {
        const settings = await this.settingsRepo.find();
        if (settings.length === 0) {
            await this.settingsRepo.save(this.settingsRepo.create({}));
        }
    }

    async getSettings() {
        return (await this.settingsRepo.find())[0];
    }

    async updateSettings(data: Partial<Settings>) {
        let settings = await this.getSettings();
        if (!settings) {
            settings = await this.settingsRepo.save(this.settingsRepo.create({}));
        }
        Object.assign(settings, data);
        return this.settingsRepo.save(settings);
    }
}

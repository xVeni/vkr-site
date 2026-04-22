import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    getSettings() {
        return this.settingsService.getSettings();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch()
    updateSettings(@Body() data: any) {
        return this.settingsService.updateSettings(data);
    }
}

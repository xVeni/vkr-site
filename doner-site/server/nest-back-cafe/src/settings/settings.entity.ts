import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('settings')
export class Settings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    isMaintenanceMode: boolean;

    @Column({ default: false })
    isSeasonalMenuEnabled: boolean;
}

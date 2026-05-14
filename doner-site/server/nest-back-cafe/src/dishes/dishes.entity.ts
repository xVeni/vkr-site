import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dishes')
export class Dish {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    image: string;

    @Column()
    title: string;

    @Column()
    weight: number;

    @Column({ nullable: true })
    desc: string;

    @Column('integer', {})
    price: number;

    @Column()
    category: number;

    @Column()
    best_sell: number;

    @Column({ type: 'decimal', nullable: true })
    discountPrice: number;

    @Column({ type: 'timestamp', nullable: true })
    discountUntil: Date;

    @Column({ default: false })
    isSeasonal: boolean;

    @Column({ type: 'float', default: 0 })
    calories: number;

    @Column({ type: 'float', default: 0 })
    proteins: number;

    @Column({ type: 'float', default: 0 })
    fats: number;

    @Column({ type: 'float', default: 0 })
    carbohydrates: number;

    @Column({ default: true })
    inStock: boolean;
}


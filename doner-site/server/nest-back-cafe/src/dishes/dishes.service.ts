import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Dish } from './dishes.entity';

@Injectable()
export class DishesService implements OnModuleInit {
  constructor(
    @InjectRepository(Dish)
    private dishRepo: Repository<Dish>,
  ) { }

  async onModuleInit() {
    try {
      const maxIdRes = await this.dishRepo.query(`SELECT MAX(id) FROM dishes`);
      const maxId = maxIdRes[0].max;
      if (maxId) {
        await this.dishRepo.query(`SELECT setval('dishes_id_seq', ${maxId})`);
        console.log(`Dishes table sequence synced to ${maxId}`);
      }
    } catch (e) {
      console.warn('Failed to sync dishes sequence:', e.message);
    }
  }

  private addFullImageUrl(dishes: Dish[] | Dish): any {
    let serverIP = process.env.IP_SERVER || 'localhost:5000';
    if (serverIP.endsWith('/')) {
      serverIP = serverIP.slice(0, -1);
    }

    if (!dishes) return null;

    if (Array.isArray(dishes)) {
      return dishes.map(d => ({
        ...d,
        image: `https://${serverIP}/images/${d.image}`,
      }));
    }

    return {
      ...dishes,
      image: `http://${serverIP}/images/${(dishes as any).image}`,
    };
  }

  async findAll(): Promise<Dish[]> {
    const dishes = await this.dishRepo.find();
    return this.addFullImageUrl(dishes);
  }

  async findFiltered(category?: number, search?: string, best_sell?: number): Promise<Dish[]> {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    if (best_sell) {
      where.best_sell = 1
    }

    const dishes = await this.dishRepo.find({ where });
    return this.addFullImageUrl(dishes);
  }

  async findOne(id: number): Promise<Dish | null> {
    const dish = await this.dishRepo.findOne({ where: { id } });
    if (!dish) return null;
    return this.addFullImageUrl(dish);
  }

  async create(data: Partial<Dish>): Promise<Dish> {
    const dish = this.dishRepo.create(data);
    return this.dishRepo.save(dish);
  }

  async update(id: number, data: Partial<Dish>): Promise<Dish | null> {
    // Если пришел полный URL картинки, убираем префикс перед сохранением в БД
    if (data.image && data.image.includes('/images/')) {
      data.image = data.image.split('/images/').pop();
    }
    await this.dishRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.dishRepo.delete(id);
  }
}

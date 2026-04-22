import { Controller, Get, Query, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { Dish } from './dishes.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) { }
  @Get()
  getAll(
    @Query('category') category?: number,
    @Query('search') search?: string,
  ): Promise<Dish[]> {
    return this.dishesService.findFiltered(category, search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() data: any) {
    return this.dishesService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.dishesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.dishesService.remove(id);
  }
}
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get('terminados')
  findTerminados(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '6'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 6;
    return this.pedidosService.findTerminados(pageNum, limitNum);
  }

  @Post()
  create(@Body() body: any) {
    return this.pedidosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.pedidosService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body('estado') estado: string,
    @Body('userId') userId: string,
  ) {
    return this.pedidosService.cambiarEstado(id, estado, userId);
  }

  @Post(':id/receta')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image and PDF files are allowed!'), false);
      }
    }
  }))
  uploadReceta(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not provided');
    }
    console.log(`[Upload] Estudio ID: ${id} | Archivo adjunto: ${file.originalname} (Tipo: ${file.mimetype}, Tamaño: ${file.size} bytes)`);
    const url = `/uploads/${file.filename}`;
    return this.pedidosService.update(id, { recetaDigitalUrl: url });
  }
}

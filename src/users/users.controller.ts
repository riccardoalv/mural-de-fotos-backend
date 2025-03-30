import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Request,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { Public } from 'src/common/decorators/public-endpoint.decorator';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Create a new user',
    operationId: 'createUser',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: GetUserDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a specific user by ID',
    operationId: 'getUserById',
  })
  @ApiResponse({
    status: 200,
    description: 'User data',
    type: GetUserDto,
  })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Lista todos os usuários com paginação e filtros',
    operationId: 'listAllUsers',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite por página',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['createdAt', 'name', 'email'],
    description: 'Campo de ordenação',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Direção da ordenação',
  })
  async findAll(@Req() req, @Query() rawQuery: any) {
    const query: any = {
      page: Number(rawQuery.page) || 1,
      limit: Number(rawQuery.limit) || 10,
      orderBy: rawQuery.orderBy || 'createdAt',
      order: rawQuery.order || 'desc',
    };

    return this.usersService.findAll(query);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update a specific user by ID',
    operationId: 'updateUserById',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: GetUserDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Delete a specific user by ID',
    operationId: 'deleteUserById',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    type: GetUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Req() req) {
    return this.usersService.remove(req.user.id);
  }
}

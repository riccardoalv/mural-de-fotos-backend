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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
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
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param() id: string) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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

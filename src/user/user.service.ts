import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import * as argon2 from 'argon2'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    })
    if (existUser) throw new BadRequestException('Это email занят!')
    const user = await this.userRepository.save({
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),
    })
    return { user }
  }

  async findAll() {
    return await this.userRepository.find()
  }

  async findOne(id: number) {
    const isExist = await this.userRepository.findOne({ where: { id } })
    if (!isExist) throw new NotFoundException('Такого пользователя нету')

    return isExist
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    })
    if (!user) throw new NotFoundException('Такого пользователя нету')

    return await this.userRepository.update(id, updateUserDto)
  }
  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    })
    if (!user) throw new NotFoundException('Такого пользователя нету')
    return await this.userRepository.delete(id)
  }
}

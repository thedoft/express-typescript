import Address from '../address/address.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Post from '../posts/post.entity';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id?: string;

  @Column()
  public fullName: string;

  @Column()
  public email: string;

  @Column()
  public password: string;

  @OneToOne(() => Address, (address: Address) => address.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  public address: Address;

  @OneToMany(() => Post, (post: Post) => post.author)
  public posts: Post[];

  @Column({ nullable: true })
  public twoFactorAuthenticationCode: string;

  @Column({ default: false })
  public isTwoFactorAuthenticationEnabled: boolean;
}

export default User;

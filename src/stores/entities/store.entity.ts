import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  storeID: number;

  @Column()
  storeName: string;

  @Column()
  takeOutInStore: boolean;

  @Column()
  shippingTimeInDays: number;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column()
  address1: string;

  @Column({ nullable: true })
  address2: string;

  @Column({ nullable: true })
  address3: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column()
  state: string;

  @Column()
  type: string;

  @Column()
  country: string;

  @Column()
  postalCode: string;

  @Column()
  telephoneNumber: string;

  @Column()
  emailAddress: string;
}
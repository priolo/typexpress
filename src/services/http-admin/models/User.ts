import { ModelBase } from "../../typeorm/models/ModelBase";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User extends ModelBase {
	
	@Column()
	username: string

	@Column({select:false})
	password: string

	@Column()
	active: boolean

}
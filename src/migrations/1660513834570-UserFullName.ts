import {MigrationInterface, QueryRunner} from "typeorm";

export class UserFullName1660513834570 implements MigrationInterface {
    name = 'UserFullName1660513834570'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('user', 'name', 'fullName');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('user', 'fullName', 'name');
    }

}

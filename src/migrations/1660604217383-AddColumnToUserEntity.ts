import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnToUserEntity1660604217383 implements MigrationInterface {
    name = 'AddColumnToUserEntity1660604217383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isTwoFactorAuthenticationEnabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isTwoFactorAuthenticationEnabled"`);
    }

}

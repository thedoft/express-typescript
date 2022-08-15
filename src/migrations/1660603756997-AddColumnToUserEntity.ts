import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnToUserEntity1660603756997 implements MigrationInterface {
    name = 'AddColumnToUserEntity1660603756997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twoFactorAuthenticationCode" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twoFactorAuthenticationCode"`);
    }

}

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateInitialSchema1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'userId',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'username', type: 'varchar', length: '30', isUnique: true },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'passwordHash', type: 'varchar', length: '255' },
          { name: 'fullName', type: 'varchar', length: '100' },
          { name: 'profilePictureUrl', type: 'text', isNullable: true },
          { name: 'bio', type: 'text', isNullable: true },
          { name: 'websiteUrl', type: 'varchar', length: '255', isNullable: true },
          { name: 'phoneNumber', type: 'varchar', length: '20', isNullable: true },
          { name: 'isPrivate', type: 'boolean', default: false },
          { name: 'isVerified', type: 'boolean', default: false },
          { name: 'isEmailVerified', type: 'boolean', default: false },
          { name: 'emailVerificationOtp', type: 'varchar', length: '6', isNullable: true },
          { name: 'emailVerificationExpiry', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'lastLoginAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({ columnNames: ['username'] }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({ columnNames: ['email'] }),
    );

    // Create Posts table
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'postId',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'userId', type: 'uuid' },
          { name: 'caption', type: 'text', isNullable: true },
          { name: 'imageUrls', type: 'json', default: '[]' },
          { name: 'videoUrl', type: 'varchar', length: '255', isNullable: true },
          { name: 'location', type: 'varchar', length: '255', isNullable: true },
          { name: 'isArchived', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'posts',
      new TableIndex({ columnNames: ['userId', 'createdAt'] }),
    );

    await queryRunner.createIndex(
      'posts',
      new TableIndex({ columnNames: ['createdAt'] }),
    );

    // Create Likes table
    await queryRunner.createTable(
      new Table({
        name: 'likes',
        columns: [
          { name: 'likeId', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'userId', type: 'uuid' },
          { name: 'postId', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
        uniques: [{ columnNames: ['userId', 'postId'] }],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'likes',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'likes',
      new TableForeignKey({
        columnNames: ['postId'],
        referencedColumnNames: ['postId'],
        referencedTableName: 'posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'likes',
      new TableIndex({ columnNames: ['postId'] }),
    );

    // Create Comments table
    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          { name: 'commentId', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'userId', type: 'uuid' },
          { name: 'postId', type: 'uuid' },
          { name: 'parentCommentId', type: 'uuid', isNullable: true },
          { name: 'content', type: 'text' },
          { name: 'isDeleted', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['postId'],
        referencedColumnNames: ['postId'],
        referencedTableName: 'posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['parentCommentId'],
        referencedColumnNames: ['commentId'],
        referencedTableName: 'comments',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'comments',
      new TableIndex({ columnNames: ['postId', 'createdAt'] }),
    );

    await queryRunner.createIndex(
      'comments',
      new TableIndex({ columnNames: ['userId'] }),
    );

    // Create Follows table
    await queryRunner.createTable(
      new Table({
        name: 'follows',
        columns: [
          { name: 'followId', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'followerId', type: 'uuid' },
          { name: 'followingId', type: 'uuid' },
          { name: 'isBlocked', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
        uniques: [{ columnNames: ['followerId', 'followingId'] }],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'follows',
      new TableForeignKey({
        columnNames: ['followerId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'follows',
      new TableForeignKey({
        columnNames: ['followingId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'follows',
      new TableIndex({ columnNames: ['followingId'] }),
    );

    // Create Notifications table
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          { name: 'notificationId', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'userId', type: 'uuid' },
          { name: 'triggeredByUserId', type: 'uuid' },
          { name: 'notificationType', type: 'varchar', length: '50' },
          { name: 'relatedPostId', type: 'uuid', isNullable: true },
          { name: 'message', type: 'text' },
          { name: 'isRead', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['triggeredByUserId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['relatedPostId'],
        referencedColumnNames: ['postId'],
        referencedTableName: 'posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({ columnNames: ['userId', 'isRead', 'createdAt'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
    await queryRunner.dropTable('follows');
    await queryRunner.dropTable('comments');
    await queryRunner.dropTable('likes');
    await queryRunner.dropTable('posts');
    await queryRunner.dropTable('users');
  }
}

import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:4000');
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'saeed@gmail.com',
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    };

    // describe('Signup', () => {
    //   it('it should signup', () => {
    //     return pactum
    //       .spec()
    //       .post('/auth/signup')
    //       .withBody(dto)
    //       .expectStatus(201);
    //   });
    // });

    describe('Signin', () => {
      it('it should return email missing', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto.password)
          .expectStatus(400)
          .stores('userAt', 'access_token');
      });
    });
    describe('Signin', () => {
      it('it should return password missing', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto.email)
          .expectStatus(400)
          .stores('userAt', 'access_token');
      });
    });
    describe('Signin', () => {
      it('it should return email and password are missing', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
          .stores('userAt', 'access_token');
      });
    });
    describe('Signin', () => {
      it('it should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('it should return unauthorized, access_token is missing.', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
    });
    describe('Get me', () => {
      it('it should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('it should edit user', () => {
        const dto: EditUserDto = {
          email: 'saeed@gmail.com',
          firstName: 'Imran',
        };
        return pactum
          .spec()
          .patch('/users/')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Docker Video',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmark by id', () => {});
    describe('Edit bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});

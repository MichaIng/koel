<?php

namespace Tests\Integration\KoelPlus\Services;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\PlusTestCase;

use function Tests\create_user;

class UserServiceTest extends PlusTestCase
{
    private UserService $service;

    public function setUp(): void
    {
        parent::setUp();

        $this->service = app(UserService::class);
    }

    public function testCreateUserViaSSOProvider(): void
    {
        $user = $this->service->createUser(
            name: 'Bruce Dickinson',
            email: 'bruce@dickison.com',
            plainTextPassword: '',
            isAdmin: false,
            avatar: 'https://lh3.googleusercontent.com/a/vatar',
            ssoId: '123',
            ssoProvider: 'Google'
        );

        self::assertModelExists($user);
        self::assertSame('Google', $user->sso_provider);
        self::assertSame('123', $user->sso_id);
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
    }

    public function testCreateUserFromSocialiteUser(): void
    {
        self::assertDatabaseMissing(User::class, ['email' => 'bruce@iron.com']);

        $socialiteUser = Mockery::mock(SocialiteUser::class, [
            'getId' => '123',
            'getEmail' => 'bruce@iron.com',
            'getName' => 'Bruce Dickinson',
            'getAvatar' => 'https://lh3.googleusercontent.com/a/vatar',
        ]);

        $user = $this->service->createOrUpdateUserFromSocialiteUser($socialiteUser, 'Google');

        self::assertModelExists($user);

        self::assertSame('Google', $user->sso_provider);
        self::assertSame('Bruce Dickinson', $user->name);
        self::assertSame('bruce@iron.com', $user->email);
        self::assertSame('123', $user->sso_id);
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
    }

    public function testUpdateUserFromSSOId(): void
    {
        $user = create_user([
            'email' => 'bruce@iron.com',
            'sso_id' => '123',
            'sso_provider' => 'Google',
        ]);

        $socialiteUser = Mockery::mock(SocialiteUser::class, [
            'getId' => '123',
            'getEmail' => 'steve@iron.com',
            'getName' => 'Steve Harris',
            'getAvatar' => 'https://lh3.googleusercontent.com/a/vatar',
        ]);

        $this->service->createOrUpdateUserFromSocialiteUser($socialiteUser, 'Google');
        $user->refresh();

        self::assertSame('Steve Harris', $user->name);
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
        self::assertSame('steve@iron.com', $user->email);
        self::assertSame('Google', $user->sso_provider);
    }

    public function testUpdateUserFromSSOEmail(): void
    {
        $user = create_user(['email' => 'bruce@iron.com']);

        $socialiteUser = Mockery::mock(SocialiteUser::class, [
            'getId' => '123',
            'getEmail' => 'bruce@iron.com',
            'getName' => 'Bruce Dickinson',
            'getAvatar' => 'https://lh3.googleusercontent.com/a/vatar',
        ]);

        $this->service->createOrUpdateUserFromSocialiteUser($socialiteUser, 'Google');
        $user->refresh();

        self::assertSame('Bruce Dickinson', $user->name);
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
        self::assertSame('Google', $user->sso_provider);
    }

    public function testUpdateSSOUserCannotChangeProfileDetails(): void
    {
        $user = create_user([
            'email' => 'bruce@iron.com',
            'name' => 'Bruce Dickinson',
            'avatar' => 'https://lh3.googleusercontent.com/a/vatar',
            'sso_provider' => 'Google',
        ]);

        $this->service->updateUser(
            user: $user,
            name: 'Steve Harris',
            email: 'steve@iron.com',
            password: 'TheTrooper',
            isAdmin: true,
            avatar: 'https://lh3.googleusercontent.com/a/vatar/2'
        );

        $user->refresh();

        self::assertSame('Bruce Dickinson', $user->name);
        self::assertSame('bruce@iron.com', $user->email);
        self::assertFalse(Hash::check('TheTrooper', $user->password));
        self::assertTrue($user->is_admin);
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\PasswordResetToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use App\Notifications\ResetPasswordNotification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_password_reset()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('oldpassword'),
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Un lien de réinitialisation a été envoyé à votre adresse e-mail'
                ]);

        // Vérifier que la notification a été envoyée
        Notification::assertSentTo($user, ResetPasswordNotification::class);

        // Vérifier qu'un token a été créé
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_user_cannot_request_reset_with_invalid_email()
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_reset_password_with_valid_token()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('oldpassword'),
        ]);

        // Créer un token valide
        $token = PasswordResetToken::generateToken('test@example.com');

        $response = $this->postJson('/api/reset-password', [
            'token' => $token->token,
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Mot de passe réinitialisé avec succès'
                ]);

        // Vérifier que le mot de passe a été mis à jour
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));

        // Vérifier que le token a été consommé
        $this->assertDatabaseMissing('password_reset_tokens', [
            'token' => $token->token,
        ]);
    }

    public function test_user_cannot_reset_password_with_invalid_token()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/reset-password', [
            'token' => 'invalid-token',
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'message' => 'Token de réinitialisation invalide ou expiré'
                ]);
    }

    public function test_user_cannot_reset_password_with_expired_token()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        // Créer un token expiré
        $token = PasswordResetToken::create([
            'email' => 'test@example.com',
            'token' => 'expired-token',
            'expires_at' => now()->subHour(),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'token' => 'expired-token',
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'message' => 'Token de réinitialisation invalide ou expiré'
                ]);
    }

    public function test_user_cannot_reset_password_with_mismatched_passwords()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = PasswordResetToken::generateToken('test@example.com');

        $response = $this->postJson('/api/reset-password', [
            'token' => $token->token,
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    public function test_user_cannot_reset_password_with_weak_password()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = PasswordResetToken::generateToken('test@example.com');

        $response = $this->postJson('/api/reset-password', [
            'token' => $token->token,
            'email' => 'test@example.com',
            'password' => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    public function test_can_verify_reset_token()
    {
        $token = PasswordResetToken::generateToken('test@example.com');

        $response = $this->postJson('/api/verify-reset-token', [
            'token' => $token->token,
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'valid' => true,
                    'message' => 'Token valide'
                ]);
    }

    public function test_can_verify_invalid_reset_token()
    {
        $response = $this->postJson('/api/verify-reset-token', [
            'token' => 'invalid-token',
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'valid' => false,
                    'message' => 'Token invalide ou expiré'
                ]);
    }
}

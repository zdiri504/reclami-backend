<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\PasswordResetToken;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $token;
    protected $user;

    /**
     * Create a new notification instance.
     */
    public function __construct($token, $user)
    {
        $this->token = $token;
        $this->user = $user;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = config('app.frontend_url', 'http://127.0.0.1:5500') . 
                   '/reset-password.html?token=' . $this->token . 
                   '&email=' . urlencode($this->user->email);

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe - Tunisie Télécom')
            ->greeting('Bonjour ' . $this->user->name . ',')
            ->line('Vous recevez cet e-mail car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.')
            ->action('Réinitialiser le mot de passe', $resetUrl)
            ->line('Ce lien de réinitialisation expirera dans 24 heures.')
            ->line('Si vous n\'avez pas demandé de réinitialisation de mot de passe, aucune action n\'est requise.')
            ->salutation('Cordialement, l\'équipe Tunisie Télécom')
            ->line('Ce lien est sécurisé et ne peut être utilisé qu\'une seule fois.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'email' => $this->user->email,
            'token' => $this->token,
            'expires_at' => now()->addHours(24),
        ];
    }
}

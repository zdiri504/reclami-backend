<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetToken extends Model
{
    protected $table = 'password_reset_tokens';

    protected $fillable = [
        'email',
        'token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Générer un nouveau token de réinitialisation
     */
    public static function generateToken($email)
    {
        // Supprimer les anciens tokens pour cet email
        self::where('email', $email)->delete();

        // Créer un nouveau token
        $token = Str::random(64);
        $expiresAt = Carbon::now()->addHours(24); // Expire dans 24h

        return self::create([
            'email' => $email,
            'token' => $token,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Vérifier si un token est valide et non expiré
     */
    public static function isValid($token, $email)
    {
        $resetToken = self::where('token', $token)
            ->where('email', $email)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        return $resetToken !== null;
    }

    /**
     * Consommer un token (le supprimer après utilisation)
     */
    public static function consume($token, $email)
    {
        return self::where('token', $token)
            ->where('email', $email)
            ->delete();
    }

    /**
     * Nettoyer les tokens expirés
     */
    public static function cleanExpired()
    {
        return self::where('expires_at', '<', Carbon::now())->delete();
    }
}

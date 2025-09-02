<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PasswordResetToken;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Envoyer un email de réinitialisation de mot de passe
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun utilisateur trouvé avec cette adresse e-mail'
                ], 404);
            }

            // Générer un token de réinitialisation
            $resetToken = PasswordResetToken::generateToken($request->email);

            // Envoyer la notification par email
            $user->notifyNow(new ResetPasswordNotification($resetToken->token, $user));
            // Nettoyer les tokens expirés
            PasswordResetToken::cleanExpired();

            Log::info('Password reset requested for email: ' . $request->email);

            return response()->json([
                'success' => true,
                'message' => 'Un lien de réinitialisation a été envoyé à votre adresse e-mail'
            ]);

        } catch (\Exception $e) {
            Log::error('Password reset error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de l\'envoi de l\'email'
            ], 500);
        }
    }

    /**
     * Réinitialiser le mot de passe avec le token
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Vérifier si le token est valide
            if (!PasswordResetToken::isValid($request->token, $request->email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de réinitialisation invalide ou expiré'
                ], 400);
            }

            // Mettre à jour le mot de passe de l'utilisateur
            $user = User::where('email', $request->email)->first();
            $user->password = Hash::make($request->password);
            $user->save();

            // Consommer le token (le supprimer)
            PasswordResetToken::consume($request->token, $request->email);

            // Révoquer tous les tokens de l'utilisateur pour la sécurité
            $user->tokens()->delete();

            Log::info('Password reset successful for email: ' . $request->email);

            return response()->json([
                'success' => true,
                'message' => 'Mot de passe réinitialisé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Password reset error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la réinitialisation'
            ], 500);
        }
    }

    /**
     * Vérifier la validité d'un token de réinitialisation
     */
    public function verifyResetToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $isValid = PasswordResetToken::isValid($request->token, $request->email);

        return response()->json([
            'success' => true,
            'valid' => $isValid,
            'message' => $isValid ? 'Token valide' : 'Token invalide ou expiré'
        ]);
    }
}
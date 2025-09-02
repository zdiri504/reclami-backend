<?php

namespace App\Console\Commands;

use App\Models\PasswordResetToken;
use Illuminate\Console\Command;

class CleanExpiredResetTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:clean-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Nettoyer les tokens de réinitialisation expirés';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $deletedCount = PasswordResetToken::cleanExpired();
        
        $this->info("{$deletedCount} tokens expirés ont été supprimés.");
        
        return Command::SUCCESS;
    }
}

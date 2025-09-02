<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('reference_id')->unique(); // e.g., TT-142
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['Internet', 'Téléphonie', 'TV', 'Facturation', 'Autre']);
            $table->string('subject');
            $table->text('description');
            $table->string('contact_info'); // Email or phone
            $table->enum('status', ['Nouveau', 'En cours', 'Résolu', 'Fermé'])->default('Nouveau');
            $table->enum('priority', ['Basse', 'Moyenne', 'Haute', 'Critique'])->default('Moyenne');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
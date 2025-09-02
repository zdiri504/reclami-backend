<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function __construct()
    {
        try {
            $this->middleware('auth:sanctum');
            $this->middleware(\App\Http\Middleware\AdminMiddleware::class);
        } catch (\Throwable $e) {
            \Log::error('AdminController middleware registration failed: ' . $e->getMessage());
            // Let the request continue; middleware failure will be apparent in logs.
        }
    }

    public function dashboardStats()
    {
        $totalComplaints = Complaint::count();
        $newComplaints = Complaint::where('status', 'Nouveau')->count();
        $inProgressComplaints = Complaint::where('status', 'En cours')->count();
        $resolvedComplaints = Complaint::where('status', 'Résolu')->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total' => $totalComplaints,
                'new' => $newComplaints,
                'in_progress' => $inProgressComplaints,
                'resolved' => $resolvedComplaints,
            ]
        ]);
    }

    // Supprimé: public function getAgents()

    public function exportComplaints(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'required|in:csv,excel,pdf',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $complaints = Complaint::with(['user']) // Supprimé: 'assignedAgent'
            ->whereBetween('created_at', [$request->start_date, $request->end_date])
            ->get();

        return response()->json([
            'success' => true,
            'complaints' => $complaints,
            'message' => 'La fonctionnalité d\'export générerait un fichier ' . $request->format
        ]);
    }
}

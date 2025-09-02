<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Response;
use App\Models\StatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Complaint::with(['user', 'responses']);

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Apply filters
        if ($request->has('status') && $request->status !== 'Tous') {
            $query->where('status', $request->status);
        }

        if ($request->has('type') && $request->type !== 'Tous') {
            $query->where('type', $request->type);
        }

        // Apply date filters
        if ($request->has('date_filter')) {
            switch ($request->date_filter) {
                case 'Derniers 7 jours':
                    $query->where('created_at', '>=', now()->subDays(7));
                    break;
                case 'Dernier mois':
                    $query->where('created_at', '>=', now()->subMonth());
                    break;
                case 'Dernier trimestre':
                    $query->where('created_at', '>=', now()->subMonths(3));
                    break;
            }
        }

        $complaints = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'complaints' => $complaints
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:Internet,Téléphonie,TV,Facturation,Autre',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'contact_info' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $complaint = Complaint::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'subject' => $request->subject,
            'description' => $request->description,
            'contact_info' => $request->contact_info,
            'status' => 'Nouveau',
            'priority' => 'Moyenne',
        ]);

        // Record status change
        StatusHistory::create([
            'complaint_id' => $complaint->id,
            'old_status' => null,
            'new_status' => 'Nouveau',
            'changed_by' => $request->user()->id,
            'notes' => 'Réclamation créée',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Réclamation soumise avec succès',
            'complaint' => $complaint
        ], 201);
    }

    public function show($id)
    {
        $complaint = Complaint::with(['user', 'responses.admin', 'statusHistory.changedBy'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'complaint' => $complaint
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Nouveau,En cours,Résolu,Fermé',
            'response' => 'required_if:status,Résolu|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Record status change
        StatusHistory::create([
            'complaint_id' => $complaint->id,
            'old_status' => $complaint->status,
            'new_status' => $request->status,
            'changed_by' => $request->user()->id,
            'notes' => $request->notes ?? 'Changement de statut effectué par ' . $request->user()->name,
        ]);

        // Update complaint status
        $complaint->status = $request->status;
        $complaint->save();

        // Add response if provided
        if ($request->has('response') && !empty($request->response)) {
            Response::create([
                'complaint_id' => $complaint->id,
                'admin_id' => $request->user()->id,
                'response' => $request->response,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'complaint' => $complaint
        ]);
    }



    public function track($reference)
    {
        $complaint = Complaint::with(['user', 'responses.admin', 'statusHistory.changedBy'])
            ->where('reference_id', $reference)
            ->first();

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Réclamation non trouvée avec cette référence'
            ], 404);
        }

        // Ensure default status if not set
        if (empty($complaint->status)) {
            $complaint->status = 'Nouveau';
        }

        // Ensure default priority if not set
        if (empty($complaint->priority)) {
            $complaint->priority = 'Moyenne';
        }

        return response()->json([
            'success' => true,
            'complaint' => $complaint
        ]);
    }
}

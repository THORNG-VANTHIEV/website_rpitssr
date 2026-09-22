<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;

    public string $loginUrl;

    public function __construct(User $user)
    {
        $this->user = $user;
        $baseUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $this->loginUrl = rtrim($baseUrl, '/').'/login';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'ការអនុម័តគណនីនិស្សិតជោគជ័យ / RPITSSR Student Account Approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account_approved',
            with: [
                'user' => $this->user,
                'loginUrl' => $this->loginUrl,
            ],
        );
    }
}

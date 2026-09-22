<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'ការជូនដំណឹងអំពីការចុះឈ្មោះគណនី / RPITSSR Account Registration Notice',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account_rejected',
            with: [
                'user' => $this->user,
            ],
        );
    }
}

<?php

namespace App\Mail;

use App\Models\Admission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdmissionSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Admission $admission;

    public string $trackUrl;

    public function __construct(Admission $admission)
    {
        $this->admission = $admission;
        $baseUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $this->trackUrl = rtrim($baseUrl, '/').'/admission/track?code='.urlencode($admission->trackingCode);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'បង្កាន់ដៃទទួលពាក្យសុំចូលរៀន / RPITSSR Online Admission Receipt ['.$this->admission->trackingCode.']',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admission_submitted',
            with: [
                'admission' => $this->admission,
                'trackUrl' => $this->trackUrl,
            ],
        );
    }
}

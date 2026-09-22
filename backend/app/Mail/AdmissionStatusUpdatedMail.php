<?php

namespace App\Mail;

use App\Models\Admission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdmissionStatusUpdatedMail extends Mailable
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
            subject: 'បច្ចុប្បន្នភាពស្ថានភាពពាក្យសុំចូលរៀន / Admission Status Update ['.$this->admission->trackingCode.']',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admission_status_updated',
            with: [
                'admission' => $this->admission,
                'trackUrl' => $this->trackUrl,
            ],
        );
    }
}

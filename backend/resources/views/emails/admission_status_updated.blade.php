<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ការជូនដំណឹងអំពីស្ថានភាពពាក្យសុំចូលរៀន / Admission Status Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 18px rgba(7, 41, 77, 0.04);">
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #07294D, #1e73be, #ffaf00);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center; background-color: #ffffff;">
              <h2 style="margin: 0 0 6px; color: #07294D; font-size: 20px; font-weight: 800;">វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប</h2>
              <p style="margin: 0; color: #1e73be; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR)</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 0;">
            </td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              @php
                $statusColors = [
                  'approved' => ['bg' => '#f0fdf4', 'border' => '#bbf7d0', 'text' => '#15803d', 'title' => 'ពាក្យសុំត្រូវបានអនុម័ត / Application Approved'],
                  'rejected' => ['bg' => '#fef2f2', 'border' => '#fecaca', 'text' => '#b91c1c', 'title' => 'ពាក្យសុំត្រូវបានបដិសេធ / Application Rejected'],
                  'enrolled' => ['bg' => '#eff6ff', 'border' => '#bfdbfe', 'text' => '#1e40af', 'title' => 'បានចុះឈ្មោះចូលរៀនជាផ្លូវការ / Officially Enrolled'],
                  'reviewing' => ['bg' => '#fefce8', 'border' => '#fef08a', 'text' => '#a16207', 'title' => 'កំពុងត្រួតពិនិត្យឯកសារ / Under Review'],
                ];
                $currentStyle = $statusColors[$admission->status] ?? ['bg' => '#f8fafc', 'border' => '#e2e8f0', 'text' => '#07294D', 'title' => 'បច្ចុប្បន្នភាពស្ថានភាពពាក្យសុំ / Status Updated'];
              @endphp

              <div style="background-color: {{ $currentStyle['bg'] }}; border: 1px solid {{ $currentStyle['border'] }}; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <h3 style="margin: 0 0 4px; color: {{ $currentStyle['text'] }}; font-size: 17px; font-weight: 700;">{{ $currentStyle['title'] }}</h3>
                <p style="margin: 0; color: #475569; font-size: 13px;">លេខកូដតាមដាន ៖ <strong>{{ $admission->trackingCode }}</strong></p>
              </div>

              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #1e293b;">
                សួស្តីប្អូន <strong>{{ $admission->khmerName }}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px; color: #475569;">
                ស្ថានភាពនៃពាក្យសុំចុះឈ្មោះចូលរៀនសម្រាប់ជំនាញ <strong>{{ $admission->major }}</strong> ({{ $admission->degreeLevel }}) ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយគណៈកម្មការជ្រើសរើសនិស្សិត។
              </p>

              @if(!empty($admission->adminNotes))
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 4px; color: #b45309; font-size: 13px; font-weight: 700;">កំណត់សម្គាល់ពីសាលា / Administration Notes:</h4>
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">{{ $admission->adminNotes }}</p>
              </div>
              @endif

              @if(!empty($admission->enrolledStudentId))
              <div style="background-color: #eff6ff; border: 1px dashed #3b82f6; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 4px; color: #1e40af; font-size: 12px; font-weight: 700; text-transform: uppercase;">អត្តលេខនិស្សិតផ្លូវការ / Official Student ID</p>
                <p style="margin: 0; color: #1e3a8a; font-size: 22px; font-weight: 800; font-family: monospace;">{{ $admission->enrolledStudentId }}</p>
              </div>
              @endif

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0 20px;">
                <a href="{{ $trackUrl }}" target="_blank" style="background: #ffaf00; color: #07294D; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 50px; display: inline-block; box-shadow: 0 4px 14px rgba(255, 175, 0, 0.35);">
                  ពិនិត្យព័ត៌មានលម្អិត / View Full Details &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 4px; font-weight: 600; color: #07294D;">វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)</p>
              <p style="margin: 0 0 8px;">ភូមិព្រៃធំ សង្កាត់ស្រង៉ែ ក្រុងសៀមរាប ខេត្តសៀមរាប | ទូរស័ព្ទ៖ 063 760 760</p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">សារអេឡិចត្រូនិចនេះត្រូវបានផ្ញើដោយស្វ័យប្រវត្តពីប្រព័ន្ធចុះឈ្មោះអនឡាញ RPITSSR។</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

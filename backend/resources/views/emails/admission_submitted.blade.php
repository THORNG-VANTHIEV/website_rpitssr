<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>បង្កាន់ដៃទទួលពាក្យសុំចូលរៀន / Admission Application Receipt</title>
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
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <h3 style="margin: 0 0 4px; color: #1e40af; font-size: 17px; font-weight: 700;">ពាក្យសុំចូលរៀនត្រូវបានទទួលជោគជ័យ!</h3>
                <p style="margin: 0; color: #1e3a8a; font-size: 13px;">Online Admission Application Received</p>
              </div>

              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #1e293b;">
                សួស្តីប្អូន <strong>{{ $admission->khmerName }}</strong> ({{ $admission->latinName }}),
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px; color: #475569;">
                វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប បានទទួលពាក្យសុំចុះឈ្មោះចូលរៀនតាមប្រព័ន្ធអនឡាញរបស់ប្អូនរួចរាល់ហើយ។ គណៈកម្មការជ្រើសរើសនិស្សិតកំពុងពិនិត្យលើឯកសារភ្ជាប់របស់អ្នក។
              </p>

              <!-- Tracking Code Banner -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #07294D; border-radius: 12px; margin-bottom: 24px; text-align: center;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 6px; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">លេខកូដតាមដានពាក្យសុំ / Tracking Code</p>
                    <p style="margin: 0; color: #ffaf00; font-size: 26px; font-weight: 800; letter-spacing: 2px; font-family: monospace;">{{ $admission->trackingCode }}</p>
                    <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 12px;">សូមរក្សាទុកលេខកូដនេះ ដើម្បីតាមដានលទ្ធផល និងស្ថានភាពពាក្យសុំរបស់អ្នក។</p>
                  </td>
                </tr>
              </table>

              <!-- Application Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px; color: #334155;">
                      <tr>
                        <td width="35%" style="color: #64748b; font-weight: 600;">កម្រិតសិក្សា / Degree:</td>
                        <td style="font-weight: 700; color: #07294D;">{{ $admission->degreeLevel }}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">ជំនាញសិក្សា / Major:</td>
                        <td style="font-weight: 700; color: #1e73be;">{{ $admission->major }}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">វេនសិក្សា / Shift:</td>
                        <td style="font-weight: 600; color: #07294D;">{{ $admission->shift }}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">ស្ថានភាព / Status:</td>
                        <td><span style="background-color: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px;">Pending (រង់ចាំការពិនិត្យ)</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0 20px;">
                <a href="{{ $trackUrl }}" target="_blank" style="background: #1e73be; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 50px; display: inline-block; box-shadow: 0 4px 14px rgba(30, 115, 190, 0.35);">
                  តាមដានស្ថានភាពពាក្យសុំ / Track Application Status &rarr;
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

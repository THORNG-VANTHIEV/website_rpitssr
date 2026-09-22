<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ការអនុម័តគណនីនិស្សិត / Account Approved</title>
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
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <span style="display: inline-block; font-size: 24px; margin-bottom: 4px;">🎉</span>
                <h3 style="margin: 0 0 4px; color: #15803d; font-size: 17px; font-weight: 700;">គណនីត្រូវបានអនុម័តជោគជ័យ! / Account Approved</h3>
                <p style="margin: 0; color: #166534; font-size: 13px;">សូមអបអរសាទរ! គណនីរបស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់រួចរាល់ហើយ។</p>
              </div>

              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #1e293b;">
                សួស្តី <strong>{{ $user->fullName ?: $user->username }}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px; color: #475569;">
                គណៈគ្រប់គ្រងវិទ្យាស្ថានបានពិនិត្យ និងអនុម័តគណនីនិស្សិតរបស់អ្នកជាផ្លូវការរួចរាល់ហើយ។ ឥឡូវនេះ អ្នកអាចចូលប្រើប្រាស់ប្រព័ន្ធផតថលនិស្សិត ដើម្បីពិនិត្យលទ្ធផលប្រឡង កាលវិភាគ និងសេវាកម្មសិក្សាផ្សេងៗ។
              </p>

              <!-- Account Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px; color: #334155;">
                      <tr>
                        <td width="35%" style="color: #64748b; font-weight: 600;">ឈ្មោះគណនី / Username:</td>
                        <td style="font-weight: 700; color: #07294D;">{{ $user->username }}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">អ៊ីមែល / Email:</td>
                        <td style="font-weight: 600; color: #07294D;">{{ $user->email }}</td>
                      </tr>
                      @if($user->studentId)
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">អត្តលេខនិស្សិត / Student ID:</td>
                        <td style="font-weight: 700; color: #1e73be;">{{ $user->studentId }}</td>
                      </tr>
                      @endif
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">ស្ថានភាព / Status:</td>
                        <td><span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px;">Active (សកម្ម)</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0 20px;">
                <a href="{{ $loginUrl }}" target="_blank" style="background: #ffaf00; color: #07294D; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 50px; display: inline-block; box-shadow: 0 4px 14px rgba(255, 175, 0, 0.35);">
                  ចូលប្រើប្រាស់ប្រព័ន្ធ / Log In to Student Portal &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 4px; font-weight: 600; color: #07294D;">វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)</p>
              <p style="margin: 0 0 8px;">ភូមិព្រៃធំ សង្កាត់ស្រង៉ែ ក្រុងសៀមរាប ខេត្តសៀមរាប | ទូរស័ព្ទ៖ 063 760 760</p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">សារអេឡិចត្រូនិចនេះត្រូវបានផ្ញើដោយស្វ័យប្រវត្តពីប្រព័ន្ធ RPITSSR Web Portal។</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía el correo de recuperación de contraseña al alumno.
 * @param {string} correo - Correo destino
 * @param {string} resetLink - Link completo con el token
 */
export const sendPasswordResetEmail = async (correo, resetLink) => {
    const { error } = await resend.emails.send({
        from: 'SerenIA <no-reply@serenia.iokort.com>', // Cambiar por tu dominio verificado en Resend
        to: [correo],
        subject: 'Recuperación de contraseña — SerenIA',
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperar Contraseña</title>
</head>
<body style="margin:0;padding:0;background:#F9F9F7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F9F7;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:32px;border:1px solid #E8EDDF;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#8BA888;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:900;letter-spacing:-1px;">
                Seren<span style="opacity:0.75;">IA</span>
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">
                Universidad Tecnológica de San Juan del Río
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:22px;font-weight:900;letter-spacing:-0.5px;">
                Recupera tu acceso
              </h2>
              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en SerenIA.
                Si no fuiste tú, puedes ignorar este correo.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${resetLink}"
                       style="display:inline-block;background:#8BA888;color:#ffffff;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:18px 40px;border-radius:50px;box-shadow:0 8px 24px rgba(139,168,136,0.35);">
                      Restablecer Contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FFF8F0;border:1px solid #FFE5C0;border-radius:16px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#CC7700;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                      ⚠ Este enlace expira en 15 minutos
                    </p>
                    <p style="margin:6px 0 0;color:#996600;font-size:11px;line-height:1.5;">
                      Por seguridad, el enlace solo puede usarse una vez.
                      Si expiró, solicita uno nuevo.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:28px 0 0;color:#aaa;font-size:11px;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                <a href="${resetLink}" style="color:#8BA888;word-break:break-all;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #F0F0F0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#ccc;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                — SerenIA · Sistema de Bienestar Estudiantil —
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    });

    if (error) {
        console.error('[email.service] Error al enviar correo:', error);
        throw new Error('No se pudo enviar el correo de recuperación');
    }
};

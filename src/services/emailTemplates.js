/**
 * Email Templates
 * Domain content for each template — shared header/footer/palette chrome
 * comes from notifier's wrapBrandedEmail, so every AlMa app's emails look consistent.
 */
import { wrapBrandedEmail } from 'notifier';

const COLORS = {
  primary: '#E8A020',
  foreground: '#172C3B',
  mutedForeground: '#6B7E8E',
  muted: '#EAECF0',
  border: '#D4DCE4',
};

/**
 * Welcome/Registration Email Template
 */
const REGISTER_TEMPLATE = ({ email }) => {
  const bodyHtml = `
    <h2 style="color:${COLORS.foreground};font-size:22px;margin:0 0 16px;">¡Bienvenido a AlMa Digital!</h2>
    <p style="font-size:16px;line-height:1.6;color:${COLORS.foreground};margin:0 0 16px;">Hola,</p>
    <p style="font-size:16px;line-height:1.6;color:${COLORS.foreground};margin:0 0 20px;">Tu cuenta ha sido creada exitosamente. Para completar la configuración de seguridad, necesitas configurar la autenticación de dos factores (2FA).</p>

    <div style="background-color:${COLORS.muted};padding:20px;border-radius:8px;margin:0 0 20px;">
      <h3 style="color:${COLORS.primary};margin:0 0 12px;font-size:16px;">Instrucciones de configuración</h3>
      <ol style="padding-left:20px;margin:0;color:${COLORS.foreground};font-size:15px;line-height:1.8;">
        <li>Descarga una aplicación de autenticación en tu dispositivo móvil</li>
        <li>Abre la aplicación y selecciona la opción para agregar una cuenta</li>
        <li>Escanea el código QR a continuación</li>
        <li>La aplicación generará códigos de verificación de 6 dígitos</li>
      </ol>
    </div>

    <div style="text-align:center;margin:0 0 20px;padding:20px;background-color:${COLORS.muted};border-radius:8px;">
      <p style="margin:0 0 12px;font-weight:bold;color:${COLORS.foreground};">Escanea este código QR:</p>
      <img src="cid:qrcode@alma" alt="Código QR para 2FA" style="max-width:250px;height:auto;display:block;margin:0 auto;" />
      <p style="font-size:14px;color:${COLORS.mutedForeground};margin-top:15px;">
        Cuenta: <span style="color:${COLORS.primary};font-weight:bold;">${email}</span>
      </p>
    </div>

    <div style="background-color:${COLORS.muted};padding:20px;border-radius:8px;margin:0 0 20px;">
      <h3 style="color:${COLORS.primary};margin:0 0 12px;font-size:16px;">Aplicaciones de autenticación recomendadas</h3>
      <ul style="list-style:none;padding:0;margin:0;">
        <li style="padding:8px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.foreground};font-size:14px;"><strong>Microsoft Authenticator</strong> — Disponible para iOS y Android</li>
        <li style="padding:8px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.foreground};font-size:14px;"><strong>Google Authenticator</strong> — Disponible para iOS y Android</li>
        <li style="padding:8px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.foreground};font-size:14px;"><strong>Apple Keychain</strong> — Integrado en dispositivos Apple (iOS 15+)</li>
        <li style="padding:8px 0;color:${COLORS.foreground};font-size:14px;"><strong>Authy</strong> — Disponible para iOS, Android y Desktop</li>
      </ul>
    </div>

    <p style="font-size:16px;line-height:1.6;color:${COLORS.foreground};margin:0 0 16px;">Una vez configurado, usarás los códigos generados por la aplicación para iniciar sesión de forma segura.</p>
    <p style="font-size:16px;line-height:1.6;color:${COLORS.foreground};margin:0 0 16px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
    <p style="font-size:16px;line-height:1.6;color:${COLORS.foreground};margin:0;">Saludos,<br><span style="color:${COLORS.primary};font-weight:bold;">El equipo de AlMa Digital</span></p>
  `.trim();

  return wrapBrandedEmail({ title: 'Bienvenido a AlMa Digital', bodyHtml });
};

export const emailTemplates = {
  REGISTER_TEMPLATE,
};

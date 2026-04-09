/**
 * Email Templates
 * HTML email templates using AlMa's color palette
 */

const COLORS = {
  primary: '#F5A623',
  secondary: '#1B2B3A',
  white: '#FFFFFF',
};

const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: ${COLORS.white};
  }
  .header {
    background-color: ${COLORS.secondary};
    padding: 30px 20px;
    text-align: center;
  }
  .header h1 {
    color: ${COLORS.primary};
    margin: 0;
    font-size: 28px;
  }
  .content {
    padding: 40px 30px;
    color: ${COLORS.secondary};
  }
  .content h2 {
    color: ${COLORS.secondary};
    font-size: 24px;
    margin-top: 0;
  }
  .content p {
    line-height: 1.6;
    font-size: 16px;
  }
  .qr-container {
    text-align: center;
    margin: 30px 0;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  .qr-container img {
    max-width: 250px;
    height: auto;
  }
  .instructions {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  }
  .instructions h3 {
    color: ${COLORS.primary};
    margin-top: 0;
  }
  .instructions ol {
    padding-left: 20px;
  }
  .instructions li {
    margin: 10px 0;
  }
  .app-list {
    list-style: none;
    padding: 0;
  }
  .app-list li {
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;
  }
  .app-list li:last-child {
    border-bottom: none;
  }
  .footer {
    background-color: ${COLORS.secondary};
    padding: 20px;
    text-align: center;
    color: ${COLORS.white};
    font-size: 14px;
  }
  .highlight {
    color: ${COLORS.primary};
    font-weight: bold;
  }
`;

/**
 * Welcome/Registration Email Template
 */
const REGISTER_TEMPLATE = ({ email }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a AlMa Digital</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AlMa Digital</h1>
    </div>

    <div class="content">
      <h2>¡Bienvenido a AlMa Digital!</h2>
      <p>Hola,</p>
      <p>Tu cuenta ha sido creada exitosamente. Para completar la configuración de seguridad, necesitas configurar la autenticación de dos factores (2FA).</p>

      <div class="instructions">
        <h3>Instrucciones de Configuración:</h3>
        <ol>
          <li>Descarga una aplicación de autenticación en tu dispositivo móvil</li>
          <li>Abre la aplicación y selecciona la opción para agregar una cuenta</li>
          <li>Escanea el código QR a continuación</li>
          <li>La aplicación generará códigos de verificación de 6 dígitos</li>
        </ol>
      </div>

      <div class="qr-container">
        <p><strong>Escanea este código QR:</strong></p>
        <img src="cid:qrcode@alma" alt="QR Code para 2FA" style="max-width: 250px; height: auto; display: block; margin: 0 auto;" />
        <p style="font-size: 14px; color: #666; margin-top: 15px;">
          Cuenta: <span class="highlight">${email}</span>
        </p>
      </div>

      <div class="instructions">
        <h3>Aplicaciones de Autenticación Recomendadas:</h3>
        <ul class="app-list">
          <li><strong>Microsoft Authenticator</strong> - Disponible para iOS y Android</li>
          <li><strong>Google Authenticator</strong> - Disponible para iOS y Android</li>
          <li><strong>Apple Keychain</strong> - Integrado en dispositivos Apple (iOS 15+)</li>
          <li><strong>Authy</strong> - Disponible para iOS, Android y Desktop</li>
        </ul>
      </div>

      <p>Una vez configurado, usarás los códigos generados por la aplicación para iniciar sesión de forma segura.</p>

      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

      <p>Saludos,<br><span class="highlight">El equipo de AlMa Digital</span></p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} AlMa Digital. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  REGISTER_TEMPLATE,
};

package com.campusmarket.server.service.impl;

import com.campusmarket.server.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Year;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.sender}")
    private String mailSenderAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Override
    public boolean isMailerConfigured() {
        boolean smtpConfigured = mailSender != null && mailUsername != null && !mailUsername.trim().isEmpty() && mailPassword != null && !mailPassword.trim().isEmpty();
        boolean apiConfigured = mailPassword != null && mailPassword.length() > 30 && mailSenderAddress != null && !mailSenderAddress.trim().isEmpty();
        return smtpConfigured || apiConfigured;
    }

    @Async
    @Override
    public void sendVerificationOTP(String toEmail, String otp, String userName) {
        if (!isMailerConfigured()) {
            System.err.println("[Mailer] Cannot send email: mail service is not configured.");
            return;
        }

        // If password looks like a Brevo API Key (> 30 chars), send via HTTP API to bypass port blocks on Render
        if (mailPassword != null && mailPassword.length() > 30) {
            try {
                System.out.println("[Mailer] Detected API key (length " + mailPassword.length() + "). Sending email via Brevo HTTP API...");
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                headers.setAccept(java.util.List.of(org.springframework.http.MediaType.APPLICATION_JSON));
                headers.set("api-key", mailPassword);

                java.util.Map<String, Object> senderMap = java.util.Map.of("name", "Campus Market", "email", mailSenderAddress);
                java.util.Map<String, Object> toMap = java.util.Map.of("email", toEmail, "name", userName != null ? userName : "Student");
                
                java.util.Map<String, Object> body = java.util.Map.of(
                    "sender", senderMap,
                    "to", java.util.List.of(toMap),
                    "subject", String.format("%s — Your Campus Market Verification Code", otp),
                    "htmlContent", buildOtpHtml(otp, userName != null ? userName : "Student")
                );

                org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(body, headers);
                org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", entity, String.class);
                
                System.out.println("[Mailer] Brevo HTTP API response: " + response.getBody());
                System.out.println("[Mailer] OTP email sent successfully via Brevo HTTP API to " + toEmail);
                return;
            } catch (Exception ex) {
                System.err.println("[Mailer Error] Brevo HTTP API failed: " + ex.getMessage() + ". Trying SMTP fallback...");
            }
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(String.format("\"Campus Market\" <%s>", mailSenderAddress));
            helper.setTo(toEmail);
            helper.setSubject(String.format("%s \u2014 Your Campus Market Verification Code", otp));
            helper.setText(buildOtpHtml(otp, userName != null ? userName : "Student"), true);

            mailSender.send(message);
            System.out.println("[Mailer] OTP email sent successfully via SMTP to " + toEmail);
        } catch (Exception ex) {
            System.err.println("[Mailer Error] Failed to send email via SMTP to " + toEmail + ": " + ex.getMessage());
        }
    }

    private String buildOtpHtml(String otp, String userName) {
        int currentYear = Year.now().getValue();
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\" />\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n" +
                "  <title>Campus Market - Email Verification</title>\n" +
                "</head>\n" +
                "<body style=\"margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;\">\n" +
                "  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f1f5f9;padding:40px 16px;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table width=\"520\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);\">\n" +
                "          <!-- Header -->\n" +
                "          <tr>\n" +
                "            <td style=\"background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;text-align:center;\">\n" +
                "              <div style=\"font-size:40px;margin-bottom:8px;\">&#127891;</div>\n" +
                "              <h1 style=\"margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;\">Campus Market</h1>\n" +
                "              <p style=\"margin:6px 0 0;color:#c7d2fe;font-size:13px;\">Student Email Verification</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <!-- Body -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding:36px 40px;\">\n" +
                "              <p style=\"margin:0 0 8px;color:#374151;font-size:15px;\">Hi <strong>" + userName + "</strong>,</p>\n" +
                "              <p style=\"margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;\">\n" +
                "                Use the verification code below to confirm your college email and earn your\n" +
                "                <strong style=\"color:#4f46e5;\">Verified Student</strong> badge on Campus Market.\n" +
                "              </p>\n" +
                "              <!-- OTP Box -->\n" +
                "              <div style=\"background:linear-gradient(135deg,#eef2ff,#ede9fe);border:2px solid #c7d2fe;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;\">\n" +
                "                <p style=\"margin:0 0 8px;color:#6366f1;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;\">Verification Code</p>\n" +
                "                <div style=\"font-size:44px;font-weight:900;letter-spacing:10px;color:#4338ca;font-family:'Courier New',monospace;\">" + otp + "</div>\n" +
                "                <p style=\"margin:12px 0 0;color:#7c3aed;font-size:12px;\">&#9201; Expires in <strong>10 minutes</strong></p>\n" +
                "              </div>\n" +
                "              <div style=\"background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:14px 18px;margin-bottom:24px;\">\n" +
                "                <p style=\"margin:0;color:#92400e;font-size:13px;\">\n" +
                "                  &#128274; <strong>Never share this code.</strong> Campus Market will never ask for it via call or chat.\n" +
                "                </p>\n" +
                "              </div>\n" +
                "              <p style=\"margin:0;color:#9ca3af;font-size:13px;line-height:1.6;\">\n" +
                "                If you didn't request this, simply ignore this email. Your account remains secure.\n" +
                "              </p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td style=\"background:#f8fafc;padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;\">\n" +
                "              <p style=\"margin:0;color:#9ca3af;font-size:12px;\">&#169; " + currentYear + " Campus Market &middot; Built for Indian Students &#127470;&#127475;</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }
}

// SMTP palsu minimal untuk e2e: menerima semua email OTP dari backend lalu membuangnya.
// Backend uji dijalankan dengan SMTP_HOST=127.0.0.1 SMTP_PORT=<port>. Kode OTP tetap
// dibaca dari database (otp_codes), bukan dari email. Alamat penerima dicatat di server.recipients
// (dipakai untuk memastikan email persetujuan/penolakan organizer terkirim).
import net from "node:net";

export function startSmtpSink(port = 2525) {
  const recipients = [];
  const server = net.createServer((socket) => {
    let inData = false;
    let buffer = "";
    socket.write("220 wavy-e2e ESMTP\r\n");
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      let idx;
      while ((idx = buffer.indexOf("\r\n")) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        if (inData) {
          if (line === ".") {
            inData = false;
            socket.write("250 OK queued\r\n");
          }
          continue;
        }
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === "EHLO") socket.write("250-wavy-e2e\r\n250-AUTH PLAIN LOGIN\r\n250 OK\r\n");
        else if (cmd === "HELO") socket.write("250 OK\r\n");
        else if (cmd === "RCPT") {
          recipients.push(line.replace(/^RCPT TO:\s*/i, "").replace(/[<>]/g, "").trim());
          socket.write("250 OK\r\n");
        } else if (cmd === "AUTH") socket.write("235 Authentication successful\r\n");
        else if (cmd === "DATA") {
          inData = true;
          socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
        } else if (cmd === "QUIT") {
          socket.write("221 Bye\r\n");
          socket.end();
        } else socket.write("250 OK\r\n");
      }
    });
    socket.on("error", () => {});
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.recipients = recipients;
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

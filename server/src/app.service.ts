import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>API Gestor Hemodinamia</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; color: #334155; }
          .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 400px; margin: 0 auto; }
          h1 { color: #2563eb; margin-bottom: 10px; }
          p { margin: 0; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Hello World! 👋</h1>
          <p>El backend de <strong>Gestor Hemodinamia</strong> está en línea y funcionando.</p>
        </div>
      </body>
      </html>
    `;
  }
}

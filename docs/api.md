## Públicos (sin autenticación)

### GET /api/locations/qr/:qrCode
Valida un código QR y retorna la sede.
**Response 200:**
```json
{ "id": "uuid", "name": "Sede Centro", "address": "Calle 123" }